import type { User } from "@workspace/shared/schemas/users/user.js";
import type { FastifyInstance } from "fastify";

import fp from "fastify-plugin";
import { ObjectId } from "mongodb";

type UserTrustEvaluation = {
  lastEvaluatedAt: Date;
  reasons: string[];
  recommendations: {
    role: User["role"];
    status: User["status"];
  };
  riskLevel: "high" | "low" | "medium";
  roleAtEvaluation: User["role"];
  scores: {
    botRisk: number;
    trust: number;
  };
  signals: {
    accountAgeDays: number;
    duplicateRatioPercent: number;
    linksInRecentComments: number;
    recentActions1h: number;
    toolComments: number;
    toolsAdded: number;
    toolsUpdated: number;
  };
  userId: ObjectId;
};

declare module "fastify" {
  interface FastifyInstance {
    evaluateUserTrust: (
      userId: ObjectId,
    ) => Promise<undefined | UserTrustEvaluation>;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const statusOrder = {
  active: 0,
  deactivated: 3,
  flagged: 1,
  suspended: 2,
} as const;

const autoStatusFlaggingPolicy = {
  deactivated: {
    botRiskScore: 95,
  },
  flagged: {
    botRiskScore: 70,
    lowTrustThreshold: 30,
    mediumBotRiskScore: 60,
  },
  suspended: {
    botRiskScore: 85,
    lowTrustThreshold: 25,
    mediumBotRiskScore: 70,
  },
} as const;

export async function evaluateUserTrust(
  fastify: FastifyInstance,
  userId: ObjectId,
): Promise<undefined | UserTrustEvaluation> {
  const users = fastify.getUserCollection();
  const tools = fastify.getToolCollection();
  const toolComments = fastify.getToolCommentCollection();

  const user = await users.findOne(
    { _id: userId },
    { projection: { _id: 1, createdAt: 1, role: 1, status: 1 } },
  );

  if (!user) return undefined;

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [
    toolsAdded,
    toolsUpdated,
    toolCommentsCount,
    recentToolComments1h,
    recentToolCommentTexts,
  ] = await Promise.all([
    tools.countDocuments({ addedBy: userId, status: "published" }),
    tools.countDocuments({ status: "published", updatedBy: userId }),
    toolComments.countDocuments({ userId }),
    toolComments.countDocuments({ createdAt: { $gte: oneHourAgo }, userId }),
    toolComments
      .find(
        { createdAt: { $gte: oneHourAgo }, userId },
        { projection: { content: 1 } },
      )
      .limit(50)
      .toArray(),
  ]);

  const recentTexts = recentToolCommentTexts.map((comment) => comment.content);

  const duplicateRatioPercent = scoreDuplicateRatio(recentTexts);
  const linksInRecentComments = countLinks(recentTexts);

  const accountAgeDays = Math.max(
    0,
    Math.floor(
      (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  const recentActions1h = recentToolComments1h;

  const trustScore = clamp(
    Math.round(
      Math.min(35, toolsAdded * 7) +
        Math.min(25, toolsUpdated * 5) +
        Math.min(20, toolCommentsCount * 1.5) +
        Math.min(20, accountAgeDays / 3),
    ),
    0,
    100,
  );

  const botRiskScore = calculateBotRisk({
    accountAgeDays,
    duplicateRatioPercent,
    linksInRecentComments,
    recentActions1h,
  });

  let recommendedRole: User["role"] = "member";

  if (botRiskScore < 20 && trustScore >= 80) {
    recommendedRole = "moderator";
  } else if (botRiskScore < 35 && trustScore >= 45) {
    recommendedRole = "contributor";
  }

  const roleAtEvaluation = user.role;
  const statusAtEvaluation = user.status;

  const isAdmin = fastify.isAdminUserId(user._id.toHexString());

  const recommendedStatus = getRecommendedStatus({
    botRiskScore,
    trustScore,
  });

  const riskLevel = getRiskLevel(botRiskScore);

  const reasons = getTrustReasons({
    accountAgeDays,
    duplicateRatioPercent,
    linksInRecentComments,
    recentActions1h,
  });

  await promoteRoleIfEligible({
    isAdmin,
    now,
    recommendedRole,
    roleAtEvaluation,
    statusAtEvaluation,
    userId: user._id,
    users,
  });

  await escalateStatusIfNeeded({
    isAdmin,
    now,
    recommendedStatus,
    statusAtEvaluation,
    userId: user._id,
    users,
  });

  return {
    lastEvaluatedAt: now,
    reasons,
    recommendations: {
      role: recommendedRole,
      status: recommendedStatus,
    },
    riskLevel,
    roleAtEvaluation,
    scores: {
      botRisk: botRiskScore,
      trust: trustScore,
    },
    signals: {
      accountAgeDays,
      duplicateRatioPercent,
      linksInRecentComments,
      recentActions1h,
      toolComments: toolCommentsCount,
      toolsAdded,
      toolsUpdated,
    },
    userId: user._id,
  };
}

function calculateBotRisk({
  accountAgeDays,
  duplicateRatioPercent,
  linksInRecentComments,
  recentActions1h,
}: {
  accountAgeDays: number;
  duplicateRatioPercent: number;
  linksInRecentComments: number;
  recentActions1h: number;
}): number {
  let score = 0;

  if (recentActions1h > 40) {
    score += 30;
  } else if (recentActions1h > 20) {
    score += 15;
  }

  if (duplicateRatioPercent > 60) {
    score += 25;
  } else if (duplicateRatioPercent > 35) {
    score += 10;
  }

  score += Math.min(25, linksInRecentComments * 5);

  if (accountAgeDays < 3 && recentActions1h > 15) {
    score += 20;
  }

  return clamp(Math.round(score), 0, 100);
}

function countLinks(comments: string[]): number {
  const urlPattern = /https?:\/\//gi;
  let total = 0;

  for (const comment of comments) {
    const matches = comment.match(urlPattern);
    total += matches?.length ?? 0;
  }

  return total;
}

async function escalateStatusIfNeeded({
  isAdmin,
  now,
  recommendedStatus,
  statusAtEvaluation,
  userId,
  users,
}: {
  isAdmin: boolean;
  now: Date;
  recommendedStatus: User["status"];
  statusAtEvaluation: User["status"];
  userId: ObjectId;
  users: ReturnType<FastifyInstance["getUserCollection"]>;
}): Promise<void> {
  if (isAdmin) return;
  if (statusOrder[recommendedStatus] <= statusOrder[statusAtEvaluation]) return;

  await users.updateOne(
    { _id: userId },
    {
      $set: {
        status: recommendedStatus,
        updatedAt: now,
      },
    },
  );
}

function getRecommendedStatus({
  botRiskScore,
  trustScore,
}: {
  botRiskScore: number;
  trustScore: number;
}): User["status"] {
  if (botRiskScore >= autoStatusFlaggingPolicy.deactivated.botRiskScore) {
    return "deactivated";
  }

  if (
    botRiskScore >= autoStatusFlaggingPolicy.suspended.botRiskScore ||
    (botRiskScore >= autoStatusFlaggingPolicy.suspended.mediumBotRiskScore &&
      trustScore <= autoStatusFlaggingPolicy.suspended.lowTrustThreshold)
  ) {
    return "suspended";
  }

  if (
    botRiskScore >= autoStatusFlaggingPolicy.flagged.botRiskScore ||
    (botRiskScore >= autoStatusFlaggingPolicy.flagged.mediumBotRiskScore &&
      trustScore <= autoStatusFlaggingPolicy.flagged.lowTrustThreshold)
  ) {
    return "flagged";
  }

  return "active";
}

function getRiskLevel(botRiskScore: number): "high" | "low" | "medium" {
  if (botRiskScore >= 85) return "high";
  if (botRiskScore >= 60) return "medium";
  return "low";
}

function getTrustReasons({
  accountAgeDays,
  duplicateRatioPercent,
  linksInRecentComments,
  recentActions1h,
}: {
  accountAgeDays: number;
  duplicateRatioPercent: number;
  linksInRecentComments: number;
  recentActions1h: number;
}): string[] {
  const reasons: string[] = [];

  if (recentActions1h > 20) reasons.push("high_velocity");
  if (duplicateRatioPercent > 35) reasons.push("repetitive_content");
  if (linksInRecentComments > 3) reasons.push("link_spam");
  if (accountAgeDays < 3 && recentActions1h > 15)
    reasons.push("new_account_burst");

  if (reasons.length === 0) reasons.push("healthy_activity");

  return reasons;
}

async function promoteRoleIfEligible({
  isAdmin,
  now,
  recommendedRole,
  roleAtEvaluation,
  statusAtEvaluation,
  userId,
  users,
}: {
  isAdmin: boolean;
  now: Date;
  recommendedRole: User["role"];
  roleAtEvaluation: User["role"];
  statusAtEvaluation: User["status"];
  userId: ObjectId;
  users: ReturnType<FastifyInstance["getUserCollection"]>;
}): Promise<void> {
  const roleOrder = {
    contributor: 1,
    member: 0,
    moderator: 2,
  } as const;

  const canPromote =
    statusAtEvaluation === "active" &&
    !isAdmin &&
    roleOrder[recommendedRole] > roleOrder[roleAtEvaluation];

  if (!canPromote) return;

  await users.updateOne(
    { _id: userId },
    {
      $set: {
        role: recommendedRole,
        updatedAt: now,
      },
    },
  );
}

function scoreDuplicateRatio(comments: string[]): number {
  if (comments.length < 6) return 0;

  const normalized = comments.map((comment) =>
    comment.trim().toLowerCase().replaceAll(/\s+/g, " "),
  );

  const unique = new Set(normalized);
  const duplicateRatio = 1 - unique.size / normalized.length;

  return clamp(Math.round(duplicateRatio * 100), 0, 100);
}

export default fp(
  async (fastify) => {
    fastify.decorate("evaluateUserTrust", async (userId: ObjectId) => {
      return evaluateUserTrust(fastify, userId);
    });
  },
  { name: "trust-policy" },
);
