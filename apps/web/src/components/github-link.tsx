import { SiGithub } from "@icons-pack/react-simple-icons";

export function GitHubLink() {
  return (
    <a
      className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
      href="https://github.com/udohjeremiah/grepedia"
      rel="noreferrer"
      target="_blank"
    >
      <SiGithub className="size-5" />
      <span className="sr-only">Visit Github repo</span>
    </a>
  );
}
