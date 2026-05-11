export const CHARACTERS = [
  { id: 'pingo', emoji: '🐧', name: 'Pingo', color: '#00c8ff' },
  { id: 'katak', emoji: '🐸', name: 'Katak', color: '#00ff87' },
  { id: 'rubah', emoji: '🦊', name: 'Rubah', color: '#ff6b35' },
  { id: 'panda', emoji: '🐼', name: 'Panda', color: '#ffffff' },
  { id: 'kucing', emoji: '🐱', name: 'Kucing', color: '#ffb347' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', color: '#d084ff' },
  { id: 'macan', emoji: '🐯', name: 'Macan', color: '#ff9900' },
  { id: 'kelinci', emoji: '🐰', name: 'Kelinci', color: '#ffb6c1' },
  { id: 'anjing', emoji: '🐶', name: 'Anjing', color: '#deb887' },
  { id: 'koala', emoji: '🐨', name: 'Koala', color: '#a0a0a0' },
  { id: 'gurita', emoji: '🐙', name: 'Gurita', color: '#ff00ff' },
  { id: 'trex', emoji: '🦖', name: 'T-Rex', color: '#228b22' },
];

export const getCharacter = (id) => CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
