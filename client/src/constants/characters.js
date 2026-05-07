export const CHARACTERS = [
  { id: 'pingo', emoji: '🐧', name: 'Pingo', color: '#00c8ff' },
  { id: 'katak', emoji: '🐸', name: 'Katak', color: '#00ff87' },
  { id: 'rubah', emoji: '🦊', name: 'Rubah', color: '#ff6b35' },
  { id: 'panda', emoji: '🐼', name: 'Panda', color: '#ffffff' },
  { id: 'kucing', emoji: '🐱', name: 'Kucing', color: '#ffb347' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', color: '#d084ff' },
];

export const getCharacter = (id) => CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
