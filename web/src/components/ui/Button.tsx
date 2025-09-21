import styled, { css } from 'styled-components';

interface ButtonProps {
  variant?: 'default' | 'primary' | 'destructive' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const variants = {
  default: css`
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    backdrop-filter: blur(10px);

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `,
  primary: css`
    background-color: rgba(56, 189, 248, 0.8); /* sky-400 */
    border: 1px solid rgba(56, 189, 248, 0.9);
    color: #FFFFFF;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(56, 189, 248, 0.2);

    &:hover {
      background-color: rgba(56, 189, 248, 0.9);
    }
  `,
  destructive: css`
    background-color: rgba(239, 68, 68, 0.8); /* red-500 */
    border: 1px solid rgba(239, 68, 68, 0.9);
    color: #FFFFFF;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);

    &:hover {
      background-color: rgba(239, 68, 68, 0.9);
    }
  `,
  ghost: css`
    background-color: transparent;
    border: 1px solid transparent;
    color: #FFFFFF;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  `,
};

const sizes = {
  default: css`
    height: 40px;
    padding: 0 16px;
  `,
  sm: css`
    height: 36px;
    padding: 0 12px;
  `,
  lg: css`
    height: 44px;
    padding: 0 32px;
  `,
  icon: css`
    height: 40px;
    width: 40px;
  `,
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:focus-visible {
    outline: 2px solid #38bdf8; /* sky-400 */
    outline-offset: 2px;
  }
  
  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  ${({ variant = 'default' }) => variants[variant]}
  ${({ size = 'default' }) => sizes[size]}
`; 