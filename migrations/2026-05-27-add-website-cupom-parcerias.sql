-- Migration: adicionar campos website e coupon em parcerias
ALTER TABLE parcerias ADD COLUMN website text;
ALTER TABLE parcerias ADD COLUMN coupon text;
