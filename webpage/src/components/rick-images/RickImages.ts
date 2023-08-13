function importAll(r: any) {
    return r.keys().map(r);
}
const hair = importAll(require.context('../../images/parts/hair', true, /\.png$/))
const coat = importAll(require.context('../../images/parts/coat', true, /\.png$/))
const shirt = importAll(require.context('../../images/parts/shirt', true, /\.png$/))
const head = importAll(require.context('../../images/parts/head', true, /\.png$/))
const face = importAll(require.context('../../images/parts/face', true, /\.png$/))
const eyebrow = importAll(require.context('../../images/parts/eyebrow', true, /\.png$/))
const eyes = importAll(require.context('../../images/parts/eyes', true, /\.png$/))
const drool = importAll(require.context('../../images/parts/drool', true, /\.png$/))
//console.log(drool)

interface ImagesInterface{
	[key: string] : ImageInterface
}

interface ImageInterface{
	[key: string] : string
}

export const rick_images = {
	hair:{
		teal: hair[3],
		green: hair[0],
		orange: hair[1],
		purple: hair[2],
		yellow: hair[4]
	},
	coat: {
		white: coat[4],
		green: coat[0],
		purple: coat[1],
		red: coat[2],
		teal: coat[3]
	},
	shirt:{
		teal: shirt[3],
		green: shirt[0],
		orange: shirt[1],
		purple: shirt[2],
	},
	head:{
		beige: head[0],
		brown: head[1],
		dark: head[2],
		gray: head[3],
	},
	face:{
		"normal": face[2],
		"baggy eyelids": face[0],
		"large wrinkle": face[1],
		"small wrinkle": face[3]
	},
	eyebrow:{
		teal: eyebrow[3],
		green: eyebrow[0],
		orange: eyebrow[1],
		purple: eyebrow[2],
		yellow: eyebrow[4]
	},
	eyes:{
		white: eyes[3],
		green: eyes[0],
		orange: eyes[1],
		red: eyes[2],
	},
	drool:{
		green: drool[0],
		orange: drool[1],
		purple: drool[2],
		teal: drool[3],
	} 
}as ImagesInterface