const imageSources = {
    'lorem': {
        url: 'https://picsum.photos/200',
        process: (response) => response.url
    },
    'dog': {
        url: 'https://dog.ceo/api/breeds/image/random',
        process: async (response) => {
            const data = await response.json();
            return data.message;
        }
    },
    'cat': {
        url: 'https://cataas.com/cat',
        process: (response) => response.url
    },
    'pokemon': {
        url: 'https://pokeapi.co/api/v2/pokemon', 
        process: async (response) => {
            const data = await response.json();
            const randomIndex = Math.floor(Math.random() * data.results.length);
            const pokemonUrl = data.results[randomIndex].url;

            const pokemonResponse = await fetch(pokemonUrl);
            const pokemonData = await pokemonResponse.json();
            return pokemonData.sprites.front_default;
        }
    }
};

const fetchImage = async (imageSource) => {
    const source = imageSources[imageSource];

    if (!source) {
        console.error('Ongeldige image source:', imageSource);
        return INVALID_API_IMAGE;
    }

    try {
        const response = await fetch(source.url);

        if (!response.ok) {
            throw new Error(`Afbeelding ophalen mislukt van: ${source.url}`);
        }

        return await source.process(response);
    } catch (error) {
        console.error('Fout bij het ophalen van afbeelding:', error);
        return API_ERROR_IMAGE;
    }
};

const generateRandomImages = async (count, imageSource) => {
    const imageUrls = [];
    const usedImageUrls = new Set();

    while (imageUrls.length < count) {
        let imageUrl = await fetchImage(imageSource);
        if (!usedImageUrls.has(imageUrl)) {
            imageUrls.push(imageUrl);
            usedImageUrls.add(imageUrl);
        }
    }
    return imageUrls;
};