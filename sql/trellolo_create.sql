-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2019-05-20 15:02:44.051

-- tables
-- Table: card
CREATE TABLE card (
    card_id serial  NOT NULL,
    column_id int  NOT NULL,
    text text  NOT NULL,
    prev_card int  NULL,
    next_card int  NULL,
    CONSTRAINT card_pk PRIMARY KEY (card_id)
);

-- Table: kanban
CREATE TABLE kanban (
    kanban_id serial  NOT NULL,
    title varchar(100)  NOT NULL,
    owner int  NOT NULL,
    CONSTRAINT kanban_pk PRIMARY KEY (kanban_id)
);

-- Table: kanban_column
CREATE TABLE kanban_column (
    column_id serial  NOT NULL,
    kanban_id int  NOT NULL,
    title char(100)  NOT NULL,
    prev_column int  NULL,
    next_column int  NULL,
    CONSTRAINT kanban_column_pk PRIMARY KEY (column_id)
);

-- Table: user
CREATE TABLE "user" (
    user_id serial  NOT NULL,
    user_name varchar(50)  NOT NULL,
    password varchar(100)  NOT NULL,
    CONSTRAINT user_pk PRIMARY KEY (user_id)
);

-- foreign keys
-- Reference: card_column (table: card)
ALTER TABLE card ADD CONSTRAINT card_column
    FOREIGN KEY (column_id)
    REFERENCES kanban_column (column_id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: card_next (table: card)
ALTER TABLE card ADD CONSTRAINT card_next
    FOREIGN KEY (next_card)
    REFERENCES card (card_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: card_prev (table: card)
ALTER TABLE card ADD CONSTRAINT card_prev
    FOREIGN KEY (prev_card)
    REFERENCES card (card_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: column_kanban (table: kanban_column)
ALTER TABLE kanban_column ADD CONSTRAINT column_kanban
    FOREIGN KEY (kanban_id)
    REFERENCES kanban (kanban_id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: kanban_column_next (table: kanban_column)
ALTER TABLE kanban_column ADD CONSTRAINT kanban_column_next
    FOREIGN KEY (next_column)
    REFERENCES kanban_column (column_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: kanban_column_prev (table: kanban_column)
ALTER TABLE kanban_column ADD CONSTRAINT kanban_column_prev
    FOREIGN KEY (prev_column)
    REFERENCES kanban_column (column_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: kanban_user (table: kanban)
ALTER TABLE kanban ADD CONSTRAINT kanban_user
    FOREIGN KEY (owner)
    REFERENCES "user" (user_id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- End of file.

