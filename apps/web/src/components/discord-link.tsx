import { SiDiscord } from "@icons-pack/react-simple-icons";

export function DiscordLink() {
  return (
    <a
      className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
      href="https://discord.gg/hnDs2Rqx"
      rel="noreferrer"
      target="_blank"
    >
      <SiDiscord className="size-5" />
      <span className="sr-only">Join Discord server</span>
    </a>
  );
}
