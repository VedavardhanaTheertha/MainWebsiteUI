import devImageConfig from "../../settings/dev/images.json";
import prodImageConfig from "../../settings/prod/images.json";

const environment = process.env.SITE_ENV || "dev";
const imageConfig = environment === "prod" ? prodImageConfig : devImageConfig;
const baseUrl = imageConfig.baseUrl;

export const imagePaths = Object.fromEntries(
	Object.entries(imageConfig.paths).map(([key, imagePath]) => [key, `${baseUrl}${imagePath}`])
) as typeof imageConfig.paths;
