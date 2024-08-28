// client/components/chat/EmojiPickerComponent.tsx
import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { ScrollArea } from "@/components/ui/scroll-area";

const emojiCategories = [
  { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'] },
  { name: 'People', emojis: ['👍', '👎', '👌', '✋', '🤚', '🖐', '✌', '🤞', '🤟', '🤘'] },
  { name: 'Animals', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'] },
  { name: 'Food', emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒'] },
];

interface EmojiPickerComponentProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPickerComponent: React.FC<EmojiPickerComponentProps> = ({ onEmojiSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(0);

  return (
    <div className="bg-background border rounded-lg shadow-lg w-64">
      <Tab.Group selectedIndex={selectedCategory} onChange={setSelectedCategory}>
        <Tab.List className="flex p-1 space-x-1 bg-muted rounded-t-lg">
          {emojiCategories.map((category, index) => (
            <Tab
              key={index}
              className={({ selected }) =>
                `w-full py-2 text-sm font-medium leading-5 text-primary rounded-lg
                 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-primary ring-primary ring-opacity-60
                 ${selected ? 'bg-background shadow' : 'text-muted-foreground hover:bg-white/[0.12] hover:text-primary'}`
              }
            >
              {category.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          {emojiCategories.map((category, index) => (
            <Tab.Panel key={index} className="p-2">
              <ScrollArea className="h-40">
                <div className="grid grid-cols-5 gap-2">
                  {category.emojis.map((emoji, emojiIndex) => (
                    <button
                      key={emojiIndex}
                      className="text-2xl hover:bg-muted rounded p-1"
                      onClick={() => onEmojiSelect(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default EmojiPickerComponent;