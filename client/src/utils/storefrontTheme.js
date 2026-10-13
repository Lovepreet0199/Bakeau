//Default Bakeau Storefront theme
export const defaultStorefrontTheme = {
    primary: "#C65F3A",
    secondary: "#F4E8DF",
    dark: "#432C23"
};


//Creates Storefront theme variables from Bakery branding
export function getStorefrontTheme(bakery) {

    return {
        "--storefront-primary":
            bakery?.primary_color ||
            defaultStorefrontTheme.primary,

        "--storefront-secondary":
            bakery?.secondary_color ||
            defaultStorefrontTheme.secondary,

        "--storefront-dark":
            bakery?.dark_color ||
            defaultStorefrontTheme.dark
    };
}