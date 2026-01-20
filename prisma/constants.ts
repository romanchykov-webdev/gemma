export const categories = [
  {
    name: 'Pizze',
  },
  {
    name: 'Colazione',
  },
  {
    name: 'Antipasti',
  },
  {
    name: 'Cocktail',
  },
  {
    name: 'Bevande',
  },
];

export const _ingredients = [
  {
    name: 'Bordo del formaggio',
    price: 2,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Bordo_del_formaggio.webp',
  },
  {
    name: 'Mocarella cremosa',
    price: 1.5,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Mozzarella_cremosa.webp',
  },
  {
    name: 'Formaggi Cheddar e Parmigiano',
    price: 2.4,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Formaggi_Cheddar_e_Parmigiano.webp',
  },
  {
    name: 'Peperoncino jalapeño piccante',
    price: 1,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Peper_piccante.webp',
  },
  {
    name: 'Pollo tenero',
    price: 2.9,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Pollo_tenero.webp',
  },
  {
    name: 'Funghi prataioli',
    price: 2,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Funghi_prataioli.webp',
  },
  {
    name: 'Prosciutto',
    price: 2.2,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Prosciutto.webp',
  },
  {
    name: 'Pepperoni piccante',
    price: 3.1,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Pepperoni_piccante.webp',
  },
  {
    name: 'Chorizo ​​piccante',
    price: 3.2,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Chorizo_piccante.webp',
  },
  {
    name: 'Cetrioli sottaceto',
    price: 1.3,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Cetrioli_sottaceto.webp',
  },
  {
    name: 'Pomodori freschi',
    price: 1.4,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Pomodori_freschi.webp',
  },
  {
    name: 'Cipolla rossa',
    price: 1.5,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Cipolla_rossa.webp',
  },
  {
    name: 'Ananas succosi',
    price: 1.6,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Ananas_succosi-1.webp',
  },
  {
    name: 'Erbe italiane',
    price: 1.7,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Erbe_italiane.webp',
  },
  {
    name: 'Peperone dolce',
    price: 1.8,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Peperone_dolce.webp',
  },
  {
    name: 'Cubetti di formaggio feta',
    price: 1.9,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Cubetti_di_formaggio_feta.webp',
  },
  {
    name: 'Polpette',
    price: 2,
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Polpette.webp',
  },
].map((obj, index) => ({ id: index + 1, ...obj }));

export const products = [
  {
    name: 'Frittata con prosciutto e funghi',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frittata_con_proscitto_e_funghi.webp',
    categoryId: 2,
  },
  {
    name: 'Frittata al salame piccante',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frittata_al_salame_piccante.webp',
    categoryId: 2,
  },
  {
    name: 'Caffè Latte',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/caffe-latte.webp',
    categoryId: 2,
  },
  {
    name: 'Prosciutto e formaggio di Danwich',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Prosciutto_e_formaggio_di_Danwich.webp',
    categoryId: 3,
  },
  {
    name: 'Bocconcini di pollo',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Bocconcini_di_pollo.webp',
    categoryId: 3,
  },
  {
    name: 'Patate al forno con salsa 🌱',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Patate_al_forno_con_salsa.webp',
    categoryId: 3,
  },
  {
    name: 'Dodster',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Dodster.webp',
    categoryId: 3,
  },
  {
    name: 'Sharp Dodster 🌶️🌶️',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Sharp_Dodster.webp',
    categoryId: 3,
  },
  {
    name: 'Frullato di banana',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frullato_di_banana.webp',
    categoryId: 4,
  },
  {
    name: 'Frullato di mele caramellate',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frullato_di_mele_caramellate.webp',
    categoryId: 4,
  },
  {
    name: 'Frullato di biscotti Oreo',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frullato_di_biscotti_Oreo.webp',
    categoryId: 4,
  },
  {
    name: 'Frullato classico 👶',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frullato_classico.webp',
    categoryId: 4,
  },
  {
    name: 'Cappuccino irlandese',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Cappuccino_irlandese.webp',
    categoryId: 5,
  },
  {
    name: 'Caffè al cappuccino al caramello',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/caffe-al-cappuccino-al-caramello.webp',
    categoryId: 5,
  },
  {
    name: 'Caffè Latte al Cocco',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/caffe-al-cappuccino-al-caramello.webp',
    categoryId: 5,
  },
  {
    name: 'Caffè americano',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/caffe-amer.webp',
    categoryId: 5,
  },
  {
    name: 'Caffè Latte2',
    imageUrl:
      'https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Caffe_Latte2.webp',
    categoryId: 5,
  },
];
