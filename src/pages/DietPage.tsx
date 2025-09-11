import food_data from "../data/food.json";

interface FoodItem {
  foodId: string;
  foodName: string;
  calories: number;
}

export default function DietPage() {
  const data: FoodItem[] = food_data;

  return (
    <ul>
      {data.map((food) => (
        <div key={food.foodId}>
          <h2>{food.foodName}</h2>
          <p>{food.calories}</p>
        </div>
      ))}
    </ul>
  );
}
