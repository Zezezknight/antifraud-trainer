interface IconInCircleProps {
  icon: React.JSX.Element;
  variants: 'lg' | 'md' | 'sm';
  backgroundColor: string;
}

function IconInCircle({ icon, variants, backgroundColor }: IconInCircleProps) {
  let padding;

  switch (variants) {
    case 'lg':
      padding = 'p-3';
      break;
    case 'md':
      padding = 'p-2';
      break;
    case 'sm':
      padding = 'p-1';
      break;

    default: {
      const _exhaustiveCheck: never = variants;
      return _exhaustiveCheck;
    }
  }

  return (
    <span className={`inline-block rounded-full ${backgroundColor} ${padding}`}>
      {icon}
    </span>
  );
}

export default IconInCircle;
