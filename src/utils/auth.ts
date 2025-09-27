/* eslint-disable @typescript-eslint/no-explicit-any */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('adminToken');
  return !!token;
};

export const login = (email: string, password: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulasi API call
    setTimeout(() => {
      if (email === 'admin@camping.com' && password === 'admin123') {
        localStorage.setItem('adminToken', 'fake-jwt-token');
        localStorage.setItem('adminUser', JSON.stringify({
          id: '1',
          email: email,
          name: 'Admin User',
          role: 'admin'
        }));
        resolve(true);
      } else {
        resolve(false);
      }
    }, 1000);
  });
};

export const logout = (): void => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

export const getCurrentUser = (): any => {
  const userStr = localStorage.getItem('adminUser');
  return userStr ? JSON.parse(userStr) : null;
};