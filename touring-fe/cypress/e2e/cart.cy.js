describe("Traveler Cart UI", () => {
  beforeEach(() => {
    // Đăng nhập
    cy.visit("/login");
    cy.get('input[name="username"]').type("nguoidungmoi");
    cy.get('input[name="password"]').type("nguoidungmoi");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/home");

    // Đợi component TourPromotions fetch xong và render TourCard
    cy.get(".tour-promotions .tour-card").should("exist");

    // Click vào một TourCard bất kỳ trong TourPromotions để vào trang chi tiết tour
    cy.get(".tour-promotions .tour-card").then(($cards) => {
      const randomIdx = Math.floor(Math.random() * $cards.length);
      cy.wrap($cards[randomIdx]).click();
    });
    cy.url().should("match", /\/tour\//); // Đảm bảo đã vào trang TourDetail với path /tour/:id

    // Bấm nút Thêm vào giỏ hàng
    cy.contains("button", "Thêm vào giỏ hàng").click();

    // Sau đó vào trang shoppingcarts
    cy.visit("/shoppingcarts");
  });

  it("should render cart page with cart items", () => {
    cy.get(".cart-item").should("exist");
  });

  it("should update quantity of a cart item", () => {
    cy.get(".cart-item").first().find(".quantity-input").clear().type("2");
    cy.get(".cart-item").first().find(".update-btn").click();
    cy.get(".cart-item")
      .first()
      .find(".quantity-input")
      .should("have.value", "2");
  });

  it("should remove an item from cart", () => {
    cy.get(".cart-item").first().find(".remove-btn").click();
    cy.get(".cart-item").should("have.length.greaterThan", 0);
  });

  it("should show empty cart message when all items removed", () => {
    cy.get(".cart-item .remove-btn").each(($btn) => {
      cy.wrap($btn).click();
    });
    cy.contains("Giỏ hàng của bạn đang trống").should("exist");
  });

  it("should proceed to checkout when button clicked", () => {
    cy.get(".checkout-btn").click();
    cy.url().should("include", "/checkout");
  });
});

// Lưu ý: Cần điều chỉnh selector (class, id) cho đúng với UI thực tế của bạn.
