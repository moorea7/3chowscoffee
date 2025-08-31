# Three Chows Coffee Company — GitHub Pages Site

Static, data-driven site for displaying current coffee offerings and taking payment via **Venmo** (no online cart).

## Quick Start
1. Replace `images/logo.png` with your color logo (same filename).
2. Replace `images/venmo-qr.png` with your Venmo QR (optional).
3. Edit **coffees.json** to set your Venmo username and offerings.
4. Push to a GitHub repo and enable **GitHub Pages** (root or `/docs`).
5. (Custom Domain) Add the `CNAME` file already included and set DNS.

### Edit coffees.json
- Set `venmo.username` to your actual Venmo handle (e.g. `@threechows`).
- Toggle `available: true/false` to show/hide items.
- Update `price`, `notes`, etc. No code changes needed.

### Custom Domain: love-coffee.com
- This repo includes a `CNAME` with `love-coffee.com`.
- In your DNS: create `A` records pointing to GitHub Pages IPs and/or a CNAME for `www` → `<username>.github.io`.
  See GitHub docs for current IPs.
- In the GitHub Pages settings, set the custom domain to `love-coffee.com` and enable HTTPS.

### No Online Ordering
This site intentionally avoids a cart/checkout. Customers pay via Venmo. The button links to your profile and the QR image is optional.

---

© Three Chows Coffee Company
