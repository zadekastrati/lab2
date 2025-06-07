// components
import Slider from '@components/Slider/Slider';
import ButtonCircle from '@components/Button/ButtonCircle';

const CircleButtons: React.FC = () => {
  const categories = [
    { icon: 'theater_comedy', text: 'Theater', categoryId: 1 },
    { icon: 'stadium', text: 'Concert', categoryId: 2 },
    { icon: 'child_care', text: 'Kids', categoryId: 3 },
    { icon: 'sports_football', text: 'Sports', categoryId: 4 },
    { icon: 'attractions', text: 'Attractions', categoryId: 5 },
    { icon: 'piano', text: 'Musical', categoryId: 6 },
    { icon: 'comedy_mask', text: 'Comedy', categoryId: 7 },
    { icon: 'festival', text: 'Festival', categoryId: 8 },
  ];

  return (
    <Slider>
      {categories.map(({ icon, text, categoryId }) => (
        <ButtonCircle
          key={categoryId}
          icon={icon}
          text={text}
          url={`list?category=${categoryId}`}
        />
      ))}
    </Slider>
  );
};

export default CircleButtons;
