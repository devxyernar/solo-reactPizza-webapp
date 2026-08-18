import React from 'react'
import { Link } from 'react-router'

export const EmptyCart = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '20px',
        fontFamily: 'sans-serif',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          padding: '40px 24px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#f2efef',
            marginBottom: '24px',
            color: '#fe5f1e',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '40px', height: '40px' }}
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </div>

        <h2
          style={{
            fontSize: '22px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 12px 0',
          }}
        >
          Ваша корзина пуста
        </h2>

        <p
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#4b5563',
            margin: '0 0 28px 0',
          }}
        >
          Похоже, вы еще не добавили ни одного товара. Перейдите в каталог, чтобы найти что-нибудь
          интересное.
        </p>

        {/* Заменили window.location на компонент Link для SPA-навигации */}
        <Link
          to="/"
          style={{
            display: 'inline-block',
            width: '100%',
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '500',
            color: '#ffffff',
            backgroundColor: '#fe5f1e',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            textDecoration: 'none',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          Перейти в каталог
        </Link>
      </div>
    </div>
  )
}
