import Image, { type ImageProps } from "next/image";

type BackdropProps = Pick<ImageProps,
  "src" | "sizes" | "quality" | "loader" | "unoptimized" | "loading" |
  "crossOrigin" | "referrerPolicy" | "overrideSrc"
>;

type ContentImageProps = Omit<ImageProps, "fill" | "width" | "height" | "className" | "style"> & {
  fill?: true;
};

export function ImageBackdrop({ loading = "lazy", ...props }: BackdropProps) {
  return (
    <Image
      {...props}
      alt=""
      aria-hidden="true"
      draggable={false}
      fill
      loading={loading}
      className="content-image-backdrop"
      data-image-layer="background"
    />
  );
}

export default function ContentImage({ src, alt, sizes, ...props }: ContentImageProps) {
  const { quality, loader, unoptimized, loading, crossOrigin, referrerPolicy, overrideSrc } = props;
  return (
    <span className="content-image-frame" data-content-image="frame">
      <ImageBackdrop
        src={src}
        sizes={sizes}
        quality={quality}
        loader={loader}
        unoptimized={unoptimized}
        loading={loading}
        crossOrigin={crossOrigin}
        referrerPolicy={referrerPolicy}
        overrideSrc={overrideSrc}
      />
      <Image
        {...props}
        src={src}
        alt={alt}
        sizes={sizes}
        fill
        className="content-image-foreground"
        data-image-layer="foreground"
      />
    </span>
  );
}
