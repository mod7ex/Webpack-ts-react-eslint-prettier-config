import { type FC } from 'react';

type Numberish = string | number;

interface Props {
    src: string;
    alt?: Numberish;
    width?: Numberish;
    height?: Numberish;
}

const AppImg: FC<Props> = ({ src, alt, height, width }) => {
    return (
        <img
            src={src}
            alt={alt ? alt.toString() : ''}
            height={height}
            width={width}
        />
    );
};

export default AppImg;
