import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/solid';
import Navbar2 from "../../Pages/Navbar"

export default function Example() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [uniqueBrands, setUniqueBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const handleProductClick = (productId, categoryId) => {
    console.log('Clicked Product ID:', productId);
    if (categoryId) {
      navigate(`/api/products/byCategory/${categoryId}/details/${productId}`);
    } else {
      navigate(`/api/products/details/${productId}`);
    }
  };

  const handlePriceChange = (newPriceRange) => {
    setPriceRange(newPriceRange);
  };

  const fetchProducts = async (categoryId) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      let url = 'http://localhost:8080/api/products';

      if (categoryId) {
        url = `http://localhost:8080/api/products/byCategory/${categoryId}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
      const uniqueBrandsArray = [...new Set(data.map((product) => product.brandName))].filter(Boolean);
      setUniqueBrands(uniqueBrandsArray);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentPath = window.location.pathname;
    const categoryIdMatch = currentPath.match(/\/api\/products\/byCategory\/(\d+)/);
    if (categoryIdMatch) {
      const categoryId = categoryIdMatch[1];
      fetchProducts(categoryId);
    } else {
      fetchProducts();
    }
  }, []);

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleResetFilter = () => {
    setBrandFilter('');
    setPriceRange([0, 10000]);
    setSearchInput('');
  };

  const handleBrandFilterChange = (event) => {
    const selectedBrand = event.target.value;
    setBrandFilter(selectedBrand);
  };

  const filteredProducts = products.filter((product) => {
    const nameMatch = product.productName.toLowerCase().includes(searchInput.toLowerCase());
    const priceMatch = (!priceRange || (product.productPrice >= priceRange[0] && product.productPrice <= priceRange[1]));
    const brandMatch = !brandFilter || product.brandName.toLowerCase() === brandFilter.toLowerCase();
    return (
      priceMatch &&
      brandMatch &&
      nameMatch
    );
  });

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <Navbar2 />
      <div className="bg-white mt-8">
        <div className="w-full md:w-2/3 shadow p-5 rounded-lg ml-[15%] mb-10 bg-white">
          <div className="relative">
            <div className="absolute flex items-center ml-2 h-full">
              <svg
                className="w-4 h-4 fill-current text-primary-gray-dark"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* SVG path here */}
              </svg>
            </div>

            <input
              type="text"
              placeholder="Search products here..."
              className="px-8 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 text-sm"
              value={searchInput}
              onChange={handleSearchInputChange}
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="font-medium">Filters</p>

            <button
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
              onClick={handleResetFilter}
            >
              Reset Filter
            </button>
          </div>

          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
              <select
                className="px-4 py-3 w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0 text-sm"
                value={brandFilter}
                onChange={handleBrandFilterChange}
              >
                <option value="">All Brands</option>
                {uniqueBrands.map((brand, index) => (
                  <option key={index} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <div className='pl-5'>
                {/* Price Range UI */}
                <label className="block text-sm font-medium text-gray-700">Price Range</label>
                <div className="">
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    step={1000}
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange([parseInt(e.target.value), priceRange[1]])}
                    className="appearance-none w-full bg-gray-300 h-3 rounded-full outline-none"
                  />
                  <div className="absolute left-0 top-0 h-1" style={{ width: `${(priceRange[0] / 10000) * 100}%` }}></div>
                  <div className="absolute right-0 top-0 h-1" style={{ width: `${((10000 - priceRange[1]) / 10000) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span className=''>₹{priceRange[0]}</span>
                  <span>₹10000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto overflow-hidden sm:px-6 lg:px-8">
          <h2 className="sr-only">Products</h2>
          <div className="-mx-px border-l border-gray-200 grid grid-cols-2 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div key={product.productId} className="group relative p-4 border-r border-b border-gray-200 sm:p-6">
                <div className="rounded-lg overflow-hidden bg-gray-200 aspect-w-1 aspect-h-1 group-hover:opacity-75">
                  <img
                    src={product.productImage}
                    alt={product.productName}
                    className="w-full h-full object-center object-cover h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72"
                    onClick={() => handleProductClick(product.productId, product.categoryId)}
                  />
                </div>
                <div className="pt-10 pb-4 text-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => handleProductClick(product.productId, product.categoryId)}
                    />
                    {product.productName}
                  </h3>
                  <div className="mt-3 flex flex-col items-center">
                    <p className="sr-only">{product.rating} out of 5 stars</p>
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <StarIcon
                          key={rating}
                          className={classNames(
                            product.rating > rating ? 'text-yellow-400' : 'text-gray-200',
                            'flex-shrink-0 h-5 w-5'
                          )}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{product.reviewCount} reviews</p>
                  </div>
                  <p className="mt-4 text-base font-medium text-gray-900">
                    <span className="font-normal">₹</span>
                    {product.productPrice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
