'use client';

import { useEffect, useState } from 'react';
import Slider from '@components/Slider/Slider';
import ButtonCircle from '@components/Button/ButtonCircle';
import { fetchCategories } from '@services/categoryService';

interface Category {
  id: number;
  name: string;
}

// Map category names to Material Icons
const categoryIcons: { [key: string]: string } = {
  'Theater': 'theater_comedy',
  'Concert': 'stadium',
  'Kids': 'child_care',
  'Sports': 'sports_football',
  'Attractions': 'attractions',
  'Musical': 'piano',
  'Comedy': 'comedy_mask',
  'Festival': 'festival',
  // Default icon for unknown categories
  'default': 'event'
};

const CircleButtons: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <Slider>
        <div className="loading-state">
          <span className="material-symbols-outlined spinning">hourglass_empty</span>
        </div>
      </Slider>
    );
  }

  return (
    <Slider>
      {categories.map((category) => (
        <ButtonCircle
          key={category.id}
          icon={categoryIcons[category.name] || categoryIcons.default}
          text={category.name}
          url={`events?category=${category.id}`}
        />
      ))}
    </Slider>
  );
};

export default CircleButtons;
