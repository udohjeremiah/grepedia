import { SiGithub } from "@icons-pack/react-simple-icons";
import { Button } from "@workspace/ui/components/button";

export default function GitHubLink() {
  return (
    <Button asChild size="icon-sm" variant="ghost">
      <a
        href="https://github.com/udohjeremiah/grepedia"
        rel="noreferrer"
        target="_blank"
      >
        <SiGithub className="size-5" />
        <span className="sr-only">Visit Github repo</span>
      </a>
    </Button>
  );
}
