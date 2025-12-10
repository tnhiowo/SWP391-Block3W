// Ant Design Theme Configuration
// Muse Dashboard Style Theme

export const themeConfig = {
  token: {
    // Primary color - Purple theme similar to Muse
    colorPrimary: '#7F56D9',
    
    // Border radius for modern look
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    
    // Typography
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    
    // Colors
    colorBgLayout: '#F5F7FA',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBorder: '#E4E7EB',
    colorBorderSecondary: '#F0F2F5',
    
    // Text colors
    colorText: '#1D2939',
    colorTextSecondary: '#667085',
    colorTextTertiary: '#98A2B3',
    
    // Shadows for cards
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    
    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    
    // Control heights
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,
  },
  components: {
    Layout: {
      bodyBg: '#F5F7FA',
      headerBg: '#FFFFFF',
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#F4EBFF',
      itemSelectedColor: '#7F56D9',
      itemHoverBg: '#F9FAFB',
      itemHoverColor: '#7F56D9',
      itemActiveBg: '#F4EBFF',
      itemMarginInline: 8,
      itemBorderRadius: 8,
      subMenuItemBg: 'transparent',
    },
    Card: {
      borderRadiusLG: 12,
      paddingLG: 24,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      boxShadowTertiary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    Table: {
      borderRadius: 8,
      headerBg: '#F9FAFB',
      headerColor: '#1D2939',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 36,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 36,
    },
  },
};

