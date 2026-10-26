from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, default="Primary Portfolio")
    description = Column(String(255), nullable=True)
    cash_balance = Column(Float, default=10000.0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    transactions = relationship("Transaction", back_populates="portfolio", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    symbol = Column(String(20), nullable=False, index=True)
    asset_type = Column(String(20), default="stock")  # stock, etf, crypto
    transaction_type = Column(String(10), nullable=False)  # buy, sell
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    fees = Column(Float, default=0.0)
    notes = Column(String(255), nullable=True)
    transaction_date = Column(DateTime, default=utc_now)
    created_at = Column(DateTime, default=utc_now)

    portfolio = relationship("Portfolio", back_populates="transactions")

class WatchlistItem(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    asset_type = Column(String(20), default="stock")
    notes = Column(String(255), nullable=True)
    added_at = Column(DateTime, default=utc_now)

class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    condition = Column(String(20), nullable=False)  # above, below, pct_gain, pct_loss
    target_value = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    is_triggered = Column(Boolean, default=False)
    triggered_at = Column(DateTime, nullable=True)
    message = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)

class SavedReport(Base):
    __tablename__ = "saved_reports"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    summary = Column(Text, nullable=True)
    report_type = Column(String(50), default="Comprehensive Analysis")
    data_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(50), index=True, default="default")
    role = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

class UserSetting(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(50), unique=True, index=True, nullable=False)
    setting_value = Column(String(255), nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
