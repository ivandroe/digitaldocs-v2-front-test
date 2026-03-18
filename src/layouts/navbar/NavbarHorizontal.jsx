import { memo } from 'react';
// @mui
import AppBar from '@mui/material/AppBar';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
// utils
import { HEADER } from '@/config';
import NavConfig from './NavConfig';
// components
import { NavSectionHorizontal } from '@/components/nav-section';

// ---------------------------------------------------------------------------------------------------------------------

const RootStyle = styled(AppBar)(({ theme }) => ({
  transition: theme.transitions.create('top', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  width: '100%',
  position: 'fixed',
  zIndex: theme.zIndex.appBar,
  padding: theme.spacing(1, 0),
  boxShadow: theme.customShadows.z8,
  top: HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT,
  backgroundColor: theme.palette.background.default,
}));

// ---------------------------------------------------------------------------------------------------------------------

function NavbarHorizontal() {
  return (
    <RootStyle>
      <Container maxWidth={false}>
        <NavSectionHorizontal navConfig={[...NavConfig]} />
      </Container>
    </RootStyle>
  );
}

export default memo(NavbarHorizontal);
