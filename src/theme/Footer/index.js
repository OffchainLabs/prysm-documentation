import React from 'react';
import OffchainLabsLogo from '@site/static/images/logo-white.png';

export default function Footer() {
  return (
    <footer class="nav-footer" id="footer">
      <a href="https://OffchainLabs.com/"><img src={OffchainLabsLogo} alt="Offchain Labs" width="150" height="125" class="footerLogo" /></a>
      <section class="copyright">Copyright © 2025 Offchain Labs</section>
    </footer>
  );
}
