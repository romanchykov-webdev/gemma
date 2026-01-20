interface Props {
  name: string;
  details: {
    base: string;
    added: string;
    removed: string;
  };
}

export const CartItemInfo: React.FC<Props> = ({ name, details }) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex-1 leading-6">{name}</h2>
      </div>
      <p className="text-xs text-gray-400">
        {details.base && <span>{details.base}</span>}
        {details.base && (details.added || details.removed) && <span>, </span>}
        {details.added && <span className="text-green-500">{details.added}</span>}
        {details.added && details.removed && <span>, </span>}
        {details.removed && <span className="text-red-500">{details.removed}</span>}
      </p>
    </div>
  );
};
