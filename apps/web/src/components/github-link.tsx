import { SiGithub } from "@icons-pack/react-simple-icons";
import { Button } from "@workspace/ui/components/button";

export default function GitHubLink() {
  return (
    <Button asChild variant="ghost" size="icon-sm">
      <a
        href="https://github.com/udohjeremiah/grepedia"
        target="_blank"
        rel="noreferrer"
      >
        <SiGithub />
      </a>
    </Button>
  );
}
