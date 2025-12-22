import { Helmet } from "react-helmet-async";

export default function PageMeta({ title, description }) {
  return (
    <Helmet>
      <title>{title || 'Quản lý Dân cư'}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
}

// ← XÓA AppWrapper - HelmetProvider ĐÃ CÓ TRONG main.jsx