import styled from 'styled-components';

export const Card = styled.div`
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.02);
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

export const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding-bottom: 1.5rem;
`;

export const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.025em;
  color: #FFFFFF;
`;

export const CardDescription = styled.p`
  font-size: 0.875rem;
  color: #94A3B8; /* slate-400 */
`;

export const CardContent = styled.div``; 