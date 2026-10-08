//Import product action icons
import { Star, X } from "lucide-react";

//Displays one bakery product card
export default function ProductCard({
    product,
    onEdit,
    onDelete,
    onToggleFeatured,
    isFeatureUpdating,
    onToggleAvailability,
    isAvailabilityUpdating,
    onToggleStatus,
    isStatusUpdating
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

                {/* Product publishing status */}
                <span
                    className={`bakery-product-status ${product.status === "active"
                        ? "bakery-product-published"
                        : product.status === "draft"
                            ? "bakery-product-draft"
                            : "bakery-product-hidden"
                        }`}
                >
                    {product.status === "active"
                        ? "Published"
                        : product.status === "draft"
                            ? "Draft"
                            : "Hidden"}
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

                    {/* Product inventory information */}
                    <span className="bakery-product-inventory">
                        {product.stock_type === "made_to_order"
                            ? "Made to order"
                            : `Inventory: ${product.inventory_quantity}`
                        }
                    </span>

                    {/* Product ordering availability */}
                    <span
                        className={`bakery-product-availability ${product.is_available ? "is-available" : "is-unavailable"
                            }`}
                    >
                        {product.is_available ? "Available" : "Unavailable"}
                    </span>

                </div>

                {/* Product quick controls */}
                {product.status !== "draft" && (
                    <div className="d-flex flex-column flex-sm-row gap-2 mb-3">

                        {/* Product ordering availability */}
                        <button
                            type="button"
                            className="btn bakery-product-quick-action flex-grow-1"
                            onClick={onToggleAvailability}
                            disabled={isAvailabilityUpdating}
                        >
                            {isAvailabilityUpdating
                                ? "Updating..."
                                : product.is_available
                                    ? "Make unavailable"
                                    : "Make available"}
                        </button>

                        {/* Product storefront visibility */}
                        <button
                            type="button"
                            className="btn bakery-product-quick-action flex-grow-1"
                            onClick={onToggleStatus}
                            disabled={isStatusUpdating}
                        >
                            {isStatusUpdating
                                ? "Updating..."
                                : product.status === "active"
                                    ? "Hide product"
                                    : "Show product"}
                        </button>

                    </div>
                )}

                {/* Product actions */}
                <div className="d-flex flex-wrap gap-2 mt-auto">

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