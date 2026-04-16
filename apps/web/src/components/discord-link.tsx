import { SiDiscord } from "@icons-pack/react-simple-icons";
import { Button } from "@workspace/ui/components/button";

export default function DiscordLink() {
  return (
    <Button asChild size="icon-sm" variant="ghost">
      <a href="https://discord.gg/hnDs2Rqx" rel="noreferrer" target="_blank">
        <SiDiscord className="size-6" />
        <span className="sr-only">Join Discord server</span>
      </a>
    </Button>
  );
}
