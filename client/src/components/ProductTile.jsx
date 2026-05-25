import './ProductTile.css';

export default function ProductTile({ product }) {
  return (
    <article
      className="product-tile"
      style={{
        backgroundColor: product.tile_bg_color || '#ffffff',
        color: product.tile_text_color || '#1f2937',
      }}
    >
      <div className="tile-image-wrap">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="tile-image" />
        ) : (
          <div className="tile-placeholder">No image</div>
        )}
      </div>
      <div className="tile-body">
        <h3 className="tile-name">{product.name}</h3>
        {product.size && <p className="tile-size">Size: {product.size}</p>}
        {product.price && <p className="tile-price">{product.price}</p>}
        {product.description && <p className="tile-desc">{product.description}</p>}
      </div>
    </article>
  );
}
