interface TypographyH1Props {
  text: string;
  className?: string;
}

export function TypographyH1({ text, className }: TypographyH1Props) {
  return (
    <h1 className={`scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance ${className || ''}`}>
      {text}
    </h1>
  );
}