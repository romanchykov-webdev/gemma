import * as auth from "./auth";
import * as cart from "./cart";
import * as categories_dashboard from "./dashboaed/categories";
import * as dough_types_dashboard from "./dashboaed/dough-types";
import * as ingredients_dashboard from "./dashboaed/ingredients";
import * as orders_dashboard from "./dashboaed/orders";
import * as product_sizes_dashboard from "./dashboaed/product-sizes";
import * as product_dashboard from "./dashboaed/products";
import * as users_dashboard from "./dashboaed/users";
import * as ingredients from "./ingredirnts";
import * as products from "./products";
import * as stories from "./stories";

//
export const Api = {
	products,
	ingredients,
	cart,
	auth,
	stories,
	categories_dashboard,
	product_dashboard,
	ingredients_dashboard,
	product_sizes_dashboard,
	dough_types_dashboard,
	orders_dashboard,
	users_dashboard,
};
