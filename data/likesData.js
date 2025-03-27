// data/likesData.js
export const CATEGORY_THEMES = {
    music: {
      label: 'Music',
      textColor: 'text-indigo-400',
    },
    quotes: {
      label: 'Quotes',
      textColor: 'text-green-400',
    },
    film: {
      label: 'Film + TV',
      textColor: 'text-blue-400',
    },
    art: {
      label: 'Fine Art',
      textColor: 'text-red-400',
    },
    random: {
      label: 'Specific Random Things',
      textColor: 'text-orange-400',
    },
    writing: {
      label: 'Writing',
      textColor: 'text-lime-400',
    }
  };
  
  export const likesData = {
    music: [
      {
        type: 'music',
        title: 'Good Guy',
        artist: 'Frank Ocean',
        albumTitle: 'Blonde',
        image: '/images/likes/goodguy.jpg',
        spotify: 'spotify:track:7oT5JOWwxnwcZRI6NLzhWs',
        id: 1
      },
      {
        type: 'music',
        title: 'Strawberry Swing',
        artist: 'Coldplay',
        albumTitle: 'Viva la Vida',
        image: '/images/likes/viva.jpg',
        spotify: 'spotify:track:1oHVRzLwayePQCMIv4p7jY',
        id: 2
      }
    ],
    quotes: [
      {
        type: 'quote',
        text: "We're all just walking each other home.",
        author: 'Ram Dass',
        id: 3
      }
    ],
    film: [
      {
        type: 'film',
        title: 'The Office',
        image: '/images/likes/office.jpg',
        id: 4
      }
    ],
    art: [
      {
        type: 'art',
        title: 'The Son of Man',
        artist: 'René Magritte',
        image: '/images/likes/son-of-man.jpg',
        id: 5
      }
    ],
    random: [
      {
        type: 'random',
        title: 'When people say "Bada bing bada boom"',
        id: 6
      }
    ],
    writing: [
      {
        type: 'writing',
        title: 'Example Book',
        image: '/images/likes/book.jpg',
        id: 7
      }
    ]
  };
  
  export const getAllItems = () => Object.values(likesData).flat();
  export const getItemsByCategory = (category) => likesData[category] || [];
  export const shuffleItems = (items) => [...items].sort(() => Math.random() - 0.5);