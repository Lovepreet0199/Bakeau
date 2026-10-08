//Import product action icons
import { Star, X } from "lucide-react";

//Displays one bakery product card
export default function ProductCard({
    product,
    onEdit,
    onDelete,
    onToggleFeatured,
    isFeatureUpdating
}) {

    return (
        <div className="card h-100 bakery-product-card">

            {/* Product image section */}
            <div className="position-relative">

                {/* Product image */}
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="card-img-top bakery-product-image"
                />

                {/* Featured badge */}
                {product.is_featured && (
                    <span className="bakery-product-featured-badge">
                        <Star size={12} fill="currentColor" />
                        Featured
                    </span>
                )}

                {/* Product availability status */}
                <span
                    className={`bakery-product-status ${product.is_available
                        ? "bakery-product-active"
                        : "bakery-product-inactive"
                        }`}
                >
                    {product.is_available ? "Active" : "Inactive"}
                </span>

            </div>

            {/* Product information */}
            <div className="card-body d-flex flex-column">

                {/* Product name and price */}
                <div className="d-flex justify-content-between align-items-start gap-3 mb-2">

                    {/* Product name */}
                    <h2 className="bakery-product-name mb-0">
                        {product.name}
                    </h2>

                    {/* Product price */}
                    <p className="bakery-product-price mb-0">
                        from ${product.base_price.toFixed(2)}
                    </p>

                </div>

                {/* Product description */}
                <p className="bakery-product-description mb-3">
                    {product.description}
                </p>

                {/* Product inventory */}
                <div className="d-flex align-items-center justify-content-between gap-2 mb-3">

                    <span className="bakery-product-inventory">
                        Inventory: {product.inventory_quantity}
                    </span>

                    {/* Storefront visibility */}
                    <span className="bakery-product-visibility">
                        {product.is_visible ? "Visible" : "Hidden"}
                    </span>

                </div>

                {/* Product actions */}
                <div className="d-flex gap-2 mt-auto">

                    {/* Edit product */}
                    <button
                        type="button"
                        className="btn bakery-product-action-button flex-grow-1"
                        onClick={onEdit}
                    >
                        Edit
                    </button>

                    {/* Feature Product */}
                    <button
                        type="button"
                        className={`btn bakery-product-action-button bakery-product-feature-button flex-grow-1 ${product.is_featured ? "is-featured" : ""
                            }`}
                        onClick={onToggleFeatured}
                        disabled={isFeatureUpdating}
                    >
                        <Star
                            size={14}
                            fill={product.is_featured ? "currentColor" : "none"}
                        />

                        {isFeatureUpdating
                            ? "Updating..."
                            : product.is_featured
                                ? "Featured"
                                : "Feature"}
                    </button>

                    {/* Delete product */}
                    <button
                        type="button"
                        className="btn bakery-product-delete-button"
                        onClick={onDelete}
                        aria-label={`Delete ${product.name}`}
                    >
                        <X size={18} />
                    </button>

                </div>

            </div>

        </div>
    );
}