import { render } from "@react-email/components";
import { type ComponentType, createElement } from "react";

interface BuildEmailOptions<Props extends object> {
  component: ComponentType<Props>;
  props: Props;
}

export async function buildEmail<Props extends object>({
  component,
  props,
}: BuildEmailOptions<Props>) {
  const template = createElement(component, props);
  return render(template);
}
