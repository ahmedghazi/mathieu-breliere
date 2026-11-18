/**
 * GROQ fragments, reusable across queries.
 * Usage: groq`*[_type == "x"][0]{ ..., seo{ ${seo} } }`
 */

/**
 * BASE
 */
// minimal shape needed by _linkResolver
export const reference = `
	_id,
	_type,
	slug,
	title
`;

export const image = `
	...,
	asset->{
		...,
		url,
		extension,
		mimeType
	}
`;

export const seo = `
	...,
	metaImage{
		${image}
	}
`;

/**
 * LINKS
 */
export const linkInternal = `
	...,
	link->{
		${reference}
	},
	// submenu[]{
	// 	...,
	// 	link->{
	// 		${reference}
	// 	},
	// }
`;

// linkInternal | linkExternal
export const link = `
	...,
	_type == 'linkInternal' => {
		${linkInternal}
	}
`;

/**
 * TEXT
 */
export const blockContent = `
	...,
	markDefs[]{
		...,
		_type == 'linkInternal' => {
			${linkInternal}
		}
	},
	_type == 'embed' => {
		...
	},
	_type == 'image' => {
		${image}
	}
`;

/**
 * MEDIA
 */
export const figure = `
	...,
	image{
		${image}
	}
`;

/**
 * CARDS
 */
export const projectCard = `
	${reference},
	imageCover{
		${image}
	},
	videoCover{
		asset->{
			...
		}
	},
	tags[]->{
		...
	}
`;
