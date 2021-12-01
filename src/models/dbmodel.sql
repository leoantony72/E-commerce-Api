CREATE TABLE users(
    userid VARCHAR(11) NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    user_role VARCHAR(25) DEFAULT 'USER' NOT NULL,
    passwordhash TEXT NOT NULL,
    registered_at TIMESTAMP NOT NULL,
    user_ip VARCHAR(50),
    active BOOLEAN DEFAULT FALSE NOT NULL,
    token TEXT UNIQUE,
    expiry TEXT
);

CREATE INDEX idx_userid ON users(userid);

CREATE TABLE user_address(
    id VARCHAR(11) NOT NULL PRIMARY KEY,
    userid VARCHAR(11) NOT NULL  REFERENCES users(userid) ON DELETE CASCADE ON UPDATE CASCADE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(255),
    postal_code VARCHAR(45),
    country VARCHAR(100),
    telephone VARCHAR(50),
    mobile VARCHAR(50)
);

CREATE INDEX idx_user_add_id ON user_address(userid);

CREATE TABLE user_payment(
    id VARCHAR(11) NOT NULL PRIMARY KEY,
    userid VARCHAR(11) NOT NULL REFERENCES users(userid)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    payment_type VARCHAR(50) NOT NULL,
);
CREATE INDEX idx_user_pay_id ON user_payment(userid);

/*product DB Design*/

CREATE TABLE products(
    pid VARCHAR(11) NOT NULL PRIMARY KEY,
    title VARCHAR(280) NOT NULL,
    image VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL,
    summary VARCHAR(325) NOT NULL,
    price DECIMAL(12,2) NOT NULL
);
CREATE INDEX idx_pid ON products(pid);

CREATE TABLE inventory(
    id VARCHAR(11) NOT NULL PRIMARY KEY REFERENCES products(pid) ON DELETE CASCADE ON UPDATE CASCADE,
    quantity INT
);
CREATE INDEX idx_inv_id ON inventory(id);

CREATE TABLE product_category(
    id VARCHAR(11) NOT NULL PRIMARY KEY REFERENCES products(pid) ON DELETE CASCADE ON UPDATE CASCADE,
    name VARCHAR(40) NOT NULL
);
CREATE INDEX idx_cat_id ON product_category(id);

CREATE TABLE discount(
    id VARCHAR(11) NOT NULL PRIMARY KEY REFERENCES products(pid) ON DELETE CASCADE ON UPDATE CASCADE,
    coupon VARCHAR(100) NOT NULL,
    description VARCHAR(300),
    discount_percent DECIMAL(12,2),
    active BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_dis_id ON discount(id);

CREATE TABLE product_rating(
    pratingid VARCHAR(11) NOT NULL PRIMARY KEY,
    userid VARCHAR(11) NOT NULL REFERENCES users(userid) 
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    pid VARCHAR(11) NOT NULL REFERENCES products(pid) 
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    rating INT NOT NULL,
    date_created TIMESTAMP NOT NULL
);
CREATE INDEX idx_pr_id ON product_rating(pid);


CREATE TABLE ratings(
    rid VARCHAR(12) NOT NULL PRIMARY KEY,
    pid VARCHAR(11) REFERENCES products(pid),
    userid VARCHAR(11) REFERENCES users(userid),
    rating_number INT NOT NULL,
    comment VARCHAR(300) NOT NULL,
    submitted TIMESTAMP NOT NULL
);

CREATE TABLE tokens(
    userid VARCHAR(11) NOT NULL REFERENCES users(userid)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expiry TEXT
);

CREATE TABLE cart(
    cart_id VARCHAR(13) NOT NULL PRIMARY KEY,
    userid VARCHAR(11) NOT NULL REFERENCES users(userid)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    pid VARCHAR(11) NOT NULL REFERENCES products(pid)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    quantity SMALLINT NOT NULL DEFAULT 1,
    date_created TIMESTAMP NOT NULL
);

CREATE INDEX cart_user_id ON cart(userid);

CREATE TABLE orders(
    order_id TEXT PRIMARY KEY NOT NULL,
    customer_id VARCHAR(11) NOT NULL REFERENCES users(userid),
    total DECIMAL(12,2) NOT NULL,
    billing_address_id VARCHAR(11) NOT NULL,
    order_status VARCHAR(100),
    payment_type VARCHAR(40) NOT NULL,
    date_created TIMESTAMP NOT NULL
);

CREATE INDEX orderidx_id ON orders(order_id);
CREATE INDEX order_cust_id ON orders(customer_id);

CREATE TABLE order_items(
    order_item_id VARCHAR(12) PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(order_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    item_id VARCHAR(11) NOT NULL REFERENCES products(pid)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    item_quantity numeric NOT NULL
);

CREATE INDEX orderidx_item_id ON order_items(order_item_id);
CREATE INDEX ordItemidx_id ON order_items(item_id);
