/* eslint jsx-a11y/heading-has-content: off */

import { forwardRef, HTMLProps } from "react";

import { cn } from "~/lib/utils";

export const TypographyH1 = forwardRef<
  HTMLHeadingElement,
  HTMLProps<HTMLHeadingElement>
>((props, ref) => (
  <h1
    {...props}
    className={cn(
      props.className,
      "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
    )}
    ref={ref}
  ></h1>
));
TypographyH1.displayName = "TypographyH1";

export const TypographyH2 = forwardRef<
  HTMLHeadingElement,
  HTMLProps<HTMLHeadingElement>
>((props, ref) => (
  <h2
    {...props}
    className={cn(
      "mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0",
      props.className,
    )}
    ref={ref}
  ></h2>
));
TypographyH2.displayName = "TypographyH2";

export const TypographyH3 = forwardRef<
  HTMLHeadingElement,
  HTMLProps<HTMLHeadingElement>
>((props, ref) => (
  <h3
    {...props}
    className={cn(
      "mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
      props.className,
    )}
    ref={ref}
  ></h3>
));
TypographyH3.displayName = "TypographyH3";

export const TypographyH4 = forwardRef<
  HTMLHeadingElement,
  HTMLProps<HTMLHeadingElement>
>((props, ref) => (
  <h4
    {...props}
    className={cn(
      "scroll-m-20 text-xl font-semibold tracking-tight",
      props.className,
    )}
    ref={ref}
  ></h4>
));
TypographyH4.displayName = "TypographyH4";

export const TypographyP = forwardRef<
  HTMLParagraphElement,
  HTMLProps<HTMLParagraphElement>
>((props, ref) => (
  <p
    {...props}
    className={cn("leading-7 [&:not(:first-child)]:mt-6", props.className)}
    ref={ref}
  ></p>
));
TypographyP.displayName = "TypographyP";

export const TypographyInlineCode = forwardRef<
  HTMLElement,
  HTMLProps<HTMLElement>
>((props, ref) => (
  <code
    {...props}
    className={cn(
      "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      props.className,
    )}
    ref={ref}
  ></code>
));
TypographyInlineCode.displayName = "TypographyInlineCode";
