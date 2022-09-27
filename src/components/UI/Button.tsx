import React, { type FC } from 'react';

enum FontSize {
    'x-small' = 1,
    'small' = 2,
    'medium' = 4,
    'large' = 6,
    'x-large' = 8,
}

type Sizes = keyof typeof FontSize;

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    label?: string;
}

type Size = { [K in Sizes]?: true };

const Button: FC<Props & Size> = ({ children, label = 'Click', ...props }) => {
    const inner_size = props['x-small']
        ? FontSize['x-small']
        : props['small']
        ? FontSize['small']
        : props['large']
        ? FontSize['large']
        : props['x-large']
        ? FontSize['x-large']
        : FontSize['medium'];

    return (
        <button
            style={{
                fontSize: `${inner_size * 0.25}rem`,
            }}
            {...props}
        >
            {children ?? label}
        </button>
    );
};

export default Button;
