import { Repository } from '../types';

export const SAMPLE_REPOSITORIES: Repository[] = [
  {
    id: 'repo-novashop',
    name: 'novashop-checkout-api',
    description: 'High-volume e-commerce backend service handling user authentication, cart checkout, and payment gateways.',
    branch: 'main',
    totalFiles: 9,
    totalFunctions: 24,
    totalClasses: 8,
    totalLines: 785,
    lastAnalyzedAt: '2026-09-25 10:14:00 UTC',
    languages: {
      Python: 82,
      Markdown: 12,
      Config: 6
    },
    files: [
      {
        name: 'auth.py',
        path: 'src/auth.py',
        language: 'python',
        size: 3420,
        lines: 104,
        imports: ['datetime', 'jwt', 'typing', 'database', 'models'],
        functions: [
          { name: 'create_access_token', kind: 'function', lineStart: 18, lineEnd: 32, parameters: ['user_id', 'expires_delta'] },
          { name: 'validate_session', kind: 'function', lineStart: 35, lineEnd: 68, parameters: ['session_token', 'refresh_context'] },
          { name: 'revoke_session', kind: 'function', lineStart: 70, lineEnd: 82, parameters: ['session_token'] },
          { name: 'get_current_user', kind: 'function', lineStart: 85, lineEnd: 103, parameters: ['authorization_header'] },
        ],
        classes: [
          { name: 'AuthManager', kind: 'class', lineStart: 12, lineEnd: 104 }
        ],
        content: `"""
NovaShop Authentication Module
Handles JWT generation, session cookie validation, and user identity verification.
"""
import datetime
from typing import Optional, Dict, Any
import jwt
from src.database import get_db_connection, cache_store
from src.models import User, SessionPayload

SECRET_KEY = "nova-staging-jwt-insecure-key-do-not-use-in-prod"
ALGORITHM = "HS256"
SESSION_TTL_MINUTES = 60

class AuthManager:
    @staticmethod
    def create_access_token(user_id: str, expires_delta: Optional[datetime.timedelta] = None) -> str:
        expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=SESSION_TTL_MINUTES))
        payload = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.datetime.utcnow(),
            "scope": "customer:checkout"
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        cache_store.set(f"session:{token}", {"user_id": user_id, "active": True}, ttl=SESSION_TTL_MINUTES * 60)
        return token

    @staticmethod
    def validate_session(session_token: str, refresh_context: bool = False) -> Optional[Dict[str, Any]]:
        """
        Validates the incoming bearer or cookie session token.
        Checks active session cache and decodes JWT claims.
        """
        if not session_token:
            return None

        # BUGGY BEHAVIOR:
        # During page reload on /checkout, client passes refresh_context=True in request headers.
        # The code incorrectly pops the session key from ephemeral cache instead of peeking/extending it!
        # This destroys the session record on a browser page refresh, forcing a logout.
        cached_session = cache_store.get(f"session:{session_token}")
        
        if refresh_context:
            # BUGGY CODE: incorrectly treats refresh as a one-time token consumption
            cache_store.delete(f"session:{session_token}")
            cached_session = None

        if not cached_session:
            return None

        try:
            payload = jwt.decode(session_token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if not user_id:
                return None
            return {"user_id": user_id, "scope": payload.get("scope"), "active": True}
        except jwt.PyJWTError:
            return None

    @staticmethod
    def revoke_session(session_token: str) -> bool:
        cache_store.delete(f"session:{session_token}")
        return True

    @staticmethod
    def get_current_user(authorization_header: Optional[str]) -> Optional[User]:
        if not authorization_header or not authorization_header.startswith("Bearer "):
            return None
        token = authorization_header.split(" ")[1]
        session = AuthManager.validate_session(token)
        if not session:
            return None
        
        db = get_db_connection()
        user_row = db.find_one("users", {"id": session["user_id"]})
        if not user_row:
            return None
        return User(**user_row)
`
      },
      {
        name: 'checkout.py',
        path: 'src/checkout.py',
        language: 'python',
        size: 3890,
        lines: 118,
        imports: ['typing', 'src.auth', 'src.payment', 'src.database', 'src.models'],
        functions: [
          { name: 'initiate_checkout', kind: 'function', lineStart: 18, lineEnd: 48, parameters: ['user_token', 'cart_id', 'is_page_refresh'] },
          { name: 'apply_voucher', kind: 'function', lineStart: 50, lineEnd: 74, parameters: ['checkout_id', 'voucher_code'] },
          { name: 'finalize_order', kind: 'function', lineStart: 77, lineEnd: 116, parameters: ['checkout_id', 'payment_method_id'] }
        ],
        classes: [
          { name: 'CheckoutService', kind: 'class', lineStart: 15, lineEnd: 117 }
        ],
        content: `"""
NovaShop Checkout Processing Pipeline
Orchestrates order creation, tax calculation, discount rules, and calls payment gateway.
"""
from typing import Dict, Any, Optional
from src.auth import AuthManager
from src.payment import PaymentProcessor
from src.database import get_db_connection
from src.models import Order, CheckoutState

class CheckoutService:
    def __init__(self):
        self.payment_processor = PaymentProcessor()
        self.db = get_db_connection()

    def initiate_checkout(self, user_token: str, cart_id: str, is_page_refresh: bool = False) -> Dict[str, Any]:
        """
        Initiates or restores a checkout session.
        Called on checkout page load and page refresh.
        """
        # Session check delegates to AuthManager with refresh flag
        session = AuthManager.validate_session(user_token, refresh_context=is_page_refresh)
        if not session:
            raise PermissionError("User session expired or invalid. Please re-authenticate.")

        user_id = session["user_id"]
        cart = self.db.find_one("carts", {"id": cart_id, "user_id": user_id})
        if not cart or not cart.get("items"):
            raise ValueError("Cart is empty or not found")

        total_amount = sum(item["price"] * item["quantity"] for item in cart["items"])
        checkout_state = CheckoutState(
            user_id=user_id,
            cart_id=cart_id,
            subtotal=total_amount,
            tax=round(total_amount * 0.08, 2),
            final_total=round(total_amount * 1.08, 2),
            status="pending_payment"
        )
        self.db.save("checkouts", checkout_state.dict())
        return checkout_state.dict()

    def apply_voucher(self, checkout_id: str, voucher_code: str) -> Dict[str, Any]:
        checkout = self.db.find_one("checkouts", {"id": checkout_id})
        if not checkout:
            raise KeyError("Checkout session not found")
        
        voucher = self.db.find_one("vouchers", {"code": voucher_code, "active": True})
        if not voucher:
            raise ValueError("Invalid discount voucher")

        discount_val = (checkout["subtotal"] * voucher["discount_pct"]) / 100
        checkout["discount"] = discount_val
        checkout["final_total"] = max(0.0, checkout["subtotal"] + checkout["tax"] - discount_val)
        self.db.update("checkouts", checkout_id, checkout)
        return checkout

    def finalize_order(self, checkout_id: str, payment_method_id: str) -> Order:
        checkout = self.db.find_one("checkouts", {"id": checkout_id})
        if not checkout or checkout["status"] != "pending_payment":
            raise ValueError("Invalid checkout state")

        # Process payment with payment processor
        payment_result = self.payment_processor.process_payment(
            amount=checkout["final_total"],
            currency="USD",
            payment_method_id=payment_method_id,
            customer_id=checkout["user_id"]
        )

        if not payment_result.get("success"):
            raise RuntimeError(f"Payment failed: {payment_result.get('error')}")

        order = Order(
            order_id=f"ORD-{checkout_id[-6:]}",
            user_id=checkout["user_id"],
            amount=checkout["final_total"],
            transaction_id=payment_result["transaction_id"],
            status="confirmed"
        )
        self.db.save("orders", order.dict())
        return order
`
      },
      {
        name: 'payment.py',
        path: 'src/payment.py',
        language: 'python',
        size: 2950,
        lines: 92,
        imports: ['typing', 'uuid', 'datetime', 'src.database'],
        functions: [
          { name: 'process_payment', kind: 'function', lineStart: 18, lineEnd: 55, parameters: ['amount', 'currency', 'payment_method_id', 'customer_id'] },
          { name: 'refund_payment', kind: 'function', lineStart: 58, lineEnd: 79, parameters: ['transaction_id', 'amount'] },
          { name: 'verify_webhook_signature', kind: 'function', lineStart: 81, lineEnd: 91, parameters: ['payload', 'signature_header'] }
        ],
        classes: [
          { name: 'PaymentProcessor', kind: 'class', lineStart: 12, lineEnd: 92 }
        ],
        content: `"""
NovaShop Payment Gateway Interface
Communicates with Stripe and PayPal APIs, records ledger transactions.
"""
import uuid
import datetime
from typing import Dict, Any
from src.database import get_db_connection

class PaymentProcessor:
    def __init__(self):
        self.db = get_db_connection()
        self.supported_currencies = {"USD", "EUR", "GBP", "CAD"}

    def process_payment(self, amount: float, currency: str, payment_method_id: str, customer_id: str) -> Dict[str, Any]:
        """
        Executes a payment charge against the customer payment source.
        """
        if amount <= 0:
            return {"success": False, "error": "Invalid charge amount"}
        if currency not in self.supported_currencies:
            return {"success": False, "error": f"Unsupported currency {currency}"}

        transaction_id = f"tx_{uuid.uuid4().hex[:16]}"
        record = {
            "transaction_id": transaction_id,
            "customer_id": customer_id,
            "amount": amount,
            "currency": currency,
            "payment_method": payment_method_id,
            "status": "succeeded",
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        self.db.save("transactions", record)
        return {"success": True, "transaction_id": transaction_id, "amount": amount}

    def refund_payment(self, transaction_id: str, amount: float) -> Dict[str, Any]:
        tx = self.db.find_one("transactions", {"transaction_id": transaction_id})
        if not tx:
            return {"success": False, "error": "Transaction not found"}
        if amount > tx["amount"]:
            return {"success": False, "error": "Refund amount exceeds original charge"}

        refund_id = f"ref_{uuid.uuid4().hex[:12]}"
        tx["refunded"] = True
        tx["refund_id"] = refund_id
        self.db.update("transactions", tx["id"], tx)
        return {"success": True, "refund_id": refund_id}

    def verify_webhook_signature(self, payload: str, signature_header: str) -> bool:
        # Insecure mock signature check - flagged by RepoDoctor
        return len(signature_header) > 10 and "sha256" in signature_header
`
      },
      {
        name: 'database.py',
        path: 'src/database.py',
        language: 'python',
        size: 2600,
        lines: 85,
        imports: ['typing', 'time'],
        functions: [
          { name: 'get_db_connection', kind: 'function', lineStart: 50, lineEnd: 54, parameters: [] }
        ],
        classes: [
          { name: 'InMemoryDatabase', kind: 'class', lineStart: 12, lineEnd: 48 },
          { name: 'CacheStore', kind: 'class', lineStart: 56, lineEnd: 84 }
        ],
        content: `"""
NovaShop Database and Cache abstraction layer.
Provides document store simulation and key-value cache.
"""
from typing import Dict, Any, Optional, List
import time

class InMemoryDatabase:
    _instance = None

    def __init__(self):
        self.tables: Dict[str, List[Dict[str, Any]]] = {
            "users": [
                {"id": "usr_101", "name": "Alice Developer", "email": "alice@example.com"},
                {"id": "usr_102", "name": "Bob Smith", "email": "bob@example.com"}
            ],
            "carts": [
                {
                    "id": "cart_999",
                    "user_id": "usr_101",
                    "items": [
                        {"item_id": "sku_prod_1", "name": "Mechanical Keyboard", "price": 129.99, "quantity": 1},
                        {"item_id": "sku_prod_2", "name": "USB-C Hub", "price": 49.50, "quantity": 2}
                    ]
                }
            ],
            "checkouts": [],
            "orders": [],
            "transactions": [],
            "vouchers": [
                {"code": "WELCOME10", "discount_pct": 10.0, "active": True}
            ]
        }

    def find_one(self, table: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        rows = self.tables.get(table, [])
        for row in rows:
            if all(row.get(k) == v for k, v in query.items()):
                return row
        return None

    def save(self, table: str, record: Dict[str, Any]) -> None:
        if table not in self.tables:
            self.tables[table] = []
        if "id" not in record:
            record["id"] = f"{table}_{len(self.tables[table]) + 1}"
        self.tables[table].append(record)

    def update(self, table: str, record_id: str, new_record: Dict[str, Any]) -> None:
        rows = self.tables.get(table, [])
        for idx, row in enumerate(rows):
            if row.get("id") == record_id:
                rows[idx] = new_record
                return

def get_db_connection() -> InMemoryDatabase:
    if InMemoryDatabase._instance is None:
        InMemoryDatabase._instance = InMemoryDatabase()
    return InMemoryDatabase._instance

class CacheStore:
    def __init__(self):
        self._store: Dict[str, Any] = {}
        self._ttls: Dict[str, float] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self._ttls and time.time() > self._ttls[key]:
            self.delete(key)
            return None
        return self._store.get(key)

    def set(self, key: str, value: Any, ttl: Optional[float] = None) -> None:
        self._store[key] = value
        if ttl:
            self._ttls[key] = time.time() + ttl

    def delete(self, key: str) -> None:
        self._store.pop(key, None)
        self._ttls.pop(key, None)

cache_store = CacheStore()
`
      },
      {
        name: 'models.py',
        path: 'src/models.py',
        language: 'python',
        size: 1540,
        lines: 52,
        imports: ['typing', 'pydantic'],
        classes: [
          { name: 'User', kind: 'class', lineStart: 8, lineEnd: 13 },
          { name: 'SessionPayload', kind: 'class', lineStart: 15, lineEnd: 21 },
          { name: 'CheckoutState', kind: 'class', lineStart: 23, lineEnd: 38 },
          { name: 'Order', kind: 'class', lineStart: 40, lineEnd: 51 }
        ],
        content: `"""
Domain models for NovaShop.
"""
from typing import List, Optional, Dict, Any

class User:
    def __init__(self, id: str, name: str, email: str):
        self.id = id
        self.name = name
        self.email = email

class SessionPayload:
    def __init__(self, user_id: str, scope: str, exp: int):
        self.user_id = user_id
        self.scope = scope
        self.exp = exp

class CheckoutState:
    def __init__(self, user_id: str, cart_id: str, subtotal: float, tax: float, final_total: float, status: str):
        self.user_id = user_id
        self.cart_id = cart_id
        self.subtotal = subtotal
        self.tax = tax
        self.final_total = final_total
        self.status = status

    def dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "cart_id": self.cart_id,
            "subtotal": self.subtotal,
            "tax": self.tax,
            "final_total": self.final_total,
            "status": self.status
        }

class Order:
    def __init__(self, order_id: str, user_id: str, amount: float, transaction_id: str, status: str):
        self.order_id = order_id
        self.user_id = user_id
        self.amount = amount
        self.transaction_id = transaction_id
        self.status = status

    def dict(self) -> Dict[str, Any]:
        return {
            "order_id": self.order_id,
            "user_id": self.user_id,
            "amount": self.amount,
            "transaction_id": self.transaction_id,
            "status": self.status
        }
`
      },
      {
        name: 'test_auth.py',
        path: 'tests/test_auth.py',
        language: 'python',
        size: 2100,
        lines: 65,
        imports: ['pytest', 'src.auth'],
        functions: [
          { name: 'test_token_creation', kind: 'function', lineStart: 12, lineEnd: 18, parameters: [] },
          { name: 'test_valid_session_decode', kind: 'function', lineStart: 20, lineEnd: 27, parameters: [] },
          { name: 'test_session_preservation_on_page_refresh', kind: 'function', lineStart: 30, lineEnd: 48, parameters: [] },
          { name: 'test_session_revocation', kind: 'function', lineStart: 50, lineEnd: 64, parameters: [] }
        ],
        content: `"""
Tests for NovaShop Authentication Module
"""
import pytest
from src.auth import AuthManager

def test_token_creation():
    token = AuthManager.create_access_token(user_id="usr_101")
    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 20

def test_valid_session_decode():
    token = AuthManager.create_access_token(user_id="usr_101")
    session = AuthManager.validate_session(token)
    assert session is not None
    assert session["user_id"] == "usr_101"
    assert session["active"] is True

def test_session_preservation_on_page_refresh():
    """
    CRITICAL TEST CASE:
    When a user refreshes the browser page (refresh_context=True),
    their session MUST remain active and valid.
    Currently FAILS due to bug in validate_session.
    """
    token = AuthManager.create_access_token(user_id="usr_101")
    
    # First access on initial page view
    session_initial = AuthManager.validate_session(token, refresh_context=False)
    assert session_initial is not None
    assert session_initial["user_id"] == "usr_101"
    
    # User hits browser reload / refresh button
    session_refreshed = AuthManager.validate_session(token, refresh_context=True)
    assert session_refreshed is not None, "User should remain logged in when refreshing the page"
    assert session_refreshed["user_id"] == "usr_101"

def test_session_revocation():
    token = AuthManager.create_access_token(user_id="usr_102")
    revoked = AuthManager.revoke_session(token)
    assert revoked is True
    session_after = AuthManager.validate_session(token)
    assert session_after is None
`
      },
      {
        name: 'test_checkout.py',
        path: 'tests/test_checkout.py',
        language: 'python',
        size: 1950,
        lines: 58,
        imports: ['pytest', 'src.checkout', 'src.auth'],
        functions: [
          { name: 'test_checkout_initiation', kind: 'function', lineStart: 12, lineEnd: 24, parameters: [] },
          { name: 'test_checkout_on_page_refresh', kind: 'function', lineStart: 27, lineEnd: 42, parameters: [] },
          { name: 'test_apply_discount_voucher', kind: 'function', lineStart: 44, lineEnd: 57, parameters: [] }
        ],
        content: `"""
Tests for NovaShop Checkout Pipeline
"""
import pytest
from src.checkout import CheckoutService
from src.auth import AuthManager

def test_checkout_initiation():
    service = CheckoutService()
    token = AuthManager.create_access_token("usr_101")
    checkout = service.initiate_checkout(user_token=token, cart_id="cart_999")
    assert checkout["subtotal"] == 228.99
    assert checkout["status"] == "pending_payment"

def test_checkout_on_page_refresh():
    """
    Verifies that refreshing the checkout page preserves the user's checkout session.
    """
    service = CheckoutService()
    token = AuthManager.create_access_token("usr_101")
    
    # First visit to checkout
    service.initiate_checkout(user_token=token, cart_id="cart_999", is_page_refresh=False)
    
    # Browser reload simulation
    refreshed = service.initiate_checkout(user_token=token, cart_id="cart_999", is_page_refresh=True)
    assert refreshed["status"] == "pending_payment"

def test_apply_discount_voucher():
    service = CheckoutService()
    token = AuthManager.create_access_token("usr_101")
    checkout = service.initiate_checkout(user_token=token, cart_id="cart_999")
    updated = service.apply_voucher(checkout["id"], "WELCOME10")
    assert "discount" in updated
    assert updated["discount"] > 0
`
      },
      {
        name: 'test_payment.py',
        path: 'tests/test_payment.py',
        language: 'python',
        size: 1350,
        lines: 42,
        imports: ['pytest', 'src.payment'],
        functions: [
          { name: 'test_process_valid_payment', kind: 'function', lineStart: 8, lineEnd: 17, parameters: [] },
          { name: 'test_reject_negative_amount', kind: 'function', lineStart: 19, lineEnd: 25, parameters: [] },
          { name: 'test_refund_flow', kind: 'function', lineStart: 27, lineEnd: 41, parameters: [] }
        ],
        content: `"""
Tests for NovaShop Payment Processor
"""
import pytest
from src.payment import PaymentProcessor

def test_process_valid_payment():
    processor = PaymentProcessor()
    res = processor.process_payment(
        amount=199.99,
        currency="USD",
        payment_method_id="pm_card_visa",
        customer_id="usr_101"
    )
    assert res["success"] is True
    assert res["transaction_id"].startswith("tx_")

def test_reject_negative_amount():
    processor = PaymentProcessor()
    res = processor.process_payment(
        amount=-50.00,
        currency="USD",
        payment_method_id="pm_card_visa",
        customer_id="usr_101"
    )
    assert res["success"] is False

def test_refund_flow():
    processor = PaymentProcessor()
    charge = processor.process_payment(100.0, "USD", "pm_card_visa", "usr_101")
    tx_id = charge["transaction_id"]
    refund = processor.refund_payment(tx_id, 100.0)
    assert refund["success"] is True
    assert refund["refund_id"].startswith("ref_")
`
      },
      {
        name: 'requirements.txt',
        path: 'requirements.txt',
        language: 'plaintext',
        size: 180,
        lines: 8,
        content: `fastapi==0.110.0
uvicorn==0.28.0
pyjwt==2.8.0
pydantic==2.6.4
redis==5.0.3
pytest==8.1.1
cryptography==42.0.5
httpx==0.27.0
`
      },
      {
        name: 'README.md',
        path: 'README.md',
        language: 'markdown',
        size: 920,
        lines: 32,
        content: `# NovaShop Checkout & Auth Service

High performance checkout processing service with JWT authentication, cart orchestration, and payment gateway adapters.

## Architecture

- \`src/auth.py\`: User session management & JWT verification.
- \`src/checkout.py\`: Order placement, tax calculations, and discount rules.
- \`src/payment.py\`: Payment gateway bridge (Stripe/PayPal).
- \`src/database.py\`: In-memory data store and cache driver.

## Testing

Run test suite via:
\`\`\`bash
pytest tests/ -v
\`\`\`
`
      }
    ]
  },
  {
    id: 'repo-taskflow',
    name: 'taskflow-dispatcher',
    description: 'Distributed async task queue and background worker orchestrator in TypeScript.',
    branch: 'master',
    totalFiles: 7,
    totalFunctions: 19,
    totalClasses: 5,
    totalLines: 610,
    lastAnalyzedAt: '2026-09-25 09:30:00 UTC',
    languages: {
      TypeScript: 85,
      JSON: 10,
      Markdown: 5
    },
    files: [
      {
        name: 'dispatcher.ts',
        path: 'src/queue/dispatcher.ts',
        language: 'typescript',
        size: 3200,
        lines: 98,
        imports: ['./worker', '../metrics', '../db'],
        functions: [
          { name: 'dispatchJob', kind: 'function', lineStart: 22, lineEnd: 45, parameters: ['jobData', 'options'] },
          { name: 'pollNextJob', kind: 'function', lineStart: 47, lineEnd: 72, parameters: ['workerId'] },
          { name: 'drainQueue', kind: 'function', lineStart: 75, lineEnd: 96, parameters: ['timeoutMs'] }
        ],
        classes: [
          { name: 'QueueDispatcher', kind: 'class', lineStart: 15, lineEnd: 97 }
        ],
        content: `import { JobWorker } from './worker';
import { recordMetric } from '../metrics';
import { prismaClient } from '../db';

export interface TaskPayload {
  id: string;
  name: string;
  payload: Record<string, unknown>;
  priority: number;
  retries: number;
}

export class QueueDispatcher {
  private queue: TaskPayload[] = [];
  private activeWorkers = new Map<string, JobWorker>();

  public async dispatchJob(jobData: TaskPayload, options?: { priorityBoost?: boolean }): Promise<string> {
    if (!jobData.id || !jobData.name) {
      throw new Error("Invalid job payload: id and name are required");
    }
    if (options?.priorityBoost) {
      jobData.priority += 10;
      this.queue.unshift(jobData);
    } else {
      this.queue.push(jobData);
    }
    recordMetric('job_enqueued', 1, { jobName: jobData.name });
    return jobData.id;
  }

  public async pollNextJob(workerId: string): Promise<TaskPayload | null> {
    if (this.queue.length === 0) {
      return null;
    }
    // Bug: Shift without atomic locking causes duplicate worker consumption during concurrency
    const job = this.queue.shift();
    if (job) {
      recordMetric('job_polled', 1, { workerId });
    }
    return job || null;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }
}
`
      },
      {
        name: 'worker.ts',
        path: 'src/queue/worker.ts',
        language: 'typescript',
        size: 2400,
        lines: 75,
        imports: ['./dispatcher', '../metrics'],
        functions: [
          { name: 'processJob', kind: 'function', lineStart: 18, lineEnd: 52, parameters: ['task'] },
          { name: 'handleFailure', kind: 'function', lineStart: 54, lineEnd: 73, parameters: ['task', 'err'] }
        ],
        classes: [
          { name: 'JobWorker', kind: 'class', lineStart: 12, lineEnd: 74 }
        ],
        content: `import { TaskPayload } from './dispatcher';
import { recordMetric } from '../metrics';

export class JobWorker {
  public id: string;
  public status: 'idle' | 'busy' | 'stopped' = 'idle';

  constructor(id: string) {
    this.id = id;
  }

  public async processJob(task: TaskPayload): Promise<{ success: boolean; result?: unknown }> {
    this.status = 'busy';
    try {
      recordMetric('worker_busy', 1, { workerId: this.id });
      // Simulate task processing
      const outcome = { executedAt: new Date().toISOString(), taskId: task.id };
      this.status = 'idle';
      return { success: true, result: outcome };
    } catch (err: any) {
      return this.handleFailure(task, err);
    }
  }

  private async handleFailure(task: TaskPayload, err: Error) {
    task.retries += 1;
    this.status = 'idle';
    return { success: false, result: err.message };
  }
}
`
      },
      {
        name: 'metrics.ts',
        path: 'src/metrics.ts',
        language: 'typescript',
        size: 1100,
        lines: 38,
        imports: [],
        functions: [
          { name: 'recordMetric', kind: 'function', lineStart: 8, lineEnd: 24, parameters: ['name', 'value', 'labels'] }
        ],
        content: `const metricRegistry: Record<string, number> = {};

export function recordMetric(name: string, value: number, labels?: Record<string, string>): void {
  const key = labels ? \`\${name}:\${JSON.stringify(labels)}\` : name;
  metricRegistry[key] = (metricRegistry[key] || 0) + value;
}

export function getMetrics(): Record<string, number> {
  return { ...metricRegistry };
}
`
      },
      {
        name: 'db.ts',
        path: 'src/db.ts',
        language: 'typescript',
        size: 950,
        lines: 32,
        imports: [],
        content: `export const prismaClient = {
  task: {
    findMany: async () => [],
    create: async (data: any) => ({ id: 'gen_1', ...data }),
    update: async (id: string, data: any) => ({ id, ...data })
  }
};
`
      },
      {
        name: 'queue.test.ts',
        path: 'tests/queue.test.ts',
        language: 'typescript',
        size: 1600,
        lines: 48,
        imports: ['../src/queue/dispatcher'],
        functions: [
          { name: 'enqueues and polls single job', kind: 'function', lineStart: 6, lineEnd: 20, parameters: [] },
          { name: 'handles priority boost', kind: 'function', lineStart: 22, lineEnd: 46, parameters: [] }
        ],
        content: `import { QueueDispatcher } from '../src/queue/dispatcher';

describe('QueueDispatcher', () => {
  let dispatcher: QueueDispatcher;

  beforeEach(() => {
    dispatcher = new QueueDispatcher();
  });

  it('enqueues and polls single job', async () => {
    const id = await dispatcher.dispatchJob({
      id: 'job_1',
      name: 'send_email',
      payload: { to: 'dev@example.com' },
      priority: 1,
      retries: 0
    });
    expect(id).toBe('job_1');
    const polled = await dispatcher.pollNextJob('worker_1');
    expect(polled?.id).toBe('job_1');
  });

  it('handles priority boost', async () => {
    await dispatcher.dispatchJob({
      id: 'low_job',
      name: 'archive_logs',
      payload: {},
      priority: 1,
      retries: 0
    });
    await dispatcher.dispatchJob({
      id: 'high_job',
      name: 'alert_pager',
      payload: {},
      priority: 1,
      retries: 0
    }, { priorityBoost: true });

    const first = await dispatcher.pollNextJob('worker_1');
    expect(first?.id).toBe('high_job');
  });
});
`
      },
      {
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        size: 480,
        lines: 20,
        content: `{
  "name": "taskflow-dispatcher",
  "version": "1.2.0",
  "description": "Distributed async task queue and worker orchestrator",
  "main": "dist/index.js",
  "scripts": {
    "test": "jest"
  },
  "dependencies": {
    "prom-client": "14.2.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "typescript": "^5.0.0"
  }
}
`
      },
      {
        name: 'README.md',
        path: 'README.md',
        language: 'markdown',
        size: 650,
        lines: 22,
        content: `# TaskFlow Dispatcher

Async queue worker designed for high-concurrency event processing.

## Running Tests
\`\`\`bash
npm test
\`\`\`
`
      }
    ]
  },
  {
    id: 'repo-finpay',
    name: 'finpay-settlement-gateway',
    description: 'FastAPI financial payment processing with webhook HMAC security and ledger records.',
    branch: 'main',
    totalFiles: 6,
    totalFunctions: 16,
    totalClasses: 4,
    totalLines: 520,
    lastAnalyzedAt: '2026-09-25 08:45:00 UTC',
    languages: {
      Python: 88,
      Config: 7,
      Markdown: 5
    },
    files: [
      {
        name: 'webhooks.py',
        path: 'app/api/webhooks.py',
        language: 'python',
        size: 2600,
        lines: 78,
        imports: ['hmac', 'hashlib', 'typing', 'app.core.security', 'app.services.ledger'],
        functions: [
          { name: 'verify_signature', kind: 'function', lineStart: 15, lineEnd: 32, parameters: ['payload', 'header_signature', 'secret'] },
          { name: 'handle_payment_intent_succeeded', kind: 'function', lineStart: 35, lineEnd: 60, parameters: ['event'] },
          { name: 'process_webhook_event', kind: 'function', lineStart: 62, lineEnd: 77, parameters: ['raw_body', 'sig_header'] }
        ],
        classes: [],
        content: `import hmac
import hashlib
from typing import Dict, Any, Optional
from app.services.ledger import record_ledger_entry

WEBHOOK_SECRET = "whsec_staging_test_secret_998877"

def verify_signature(payload: bytes, header_signature: str, secret: str = WEBHOOK_SECRET) -> bool:
    """
    Verifies HMAC SHA-256 signature from payment provider.
    BUG: Uses standard == string equality instead of constant-time compare hmac.compare_digest
    and expects raw hex without prefix splitting 't=...,v1=...'
    """
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    # Insecure timing-attack vulnerable comparison
    return expected == header_signature

def handle_payment_intent_succeeded(event: Dict[str, Any]) -> Dict[str, Any]:
    data = event.get("data", {}).get("object", {})
    amount = data.get("amount", 0) / 100.0
    account_id = data.get("customer", "unknown")
    entry = record_ledger_entry(account_id, amount, "credit")
    return {"status": "recorded", "ledger_id": entry["id"]}

def process_webhook_event(raw_body: bytes, sig_header: str) -> Dict[str, Any]:
    if not verify_signature(raw_body, sig_header):
        raise ValueError("Invalid webhook signature")
    return {"status": "verified"}
`
      },
      {
        name: 'ledger.py',
        path: 'app/services/ledger.py',
        language: 'python',
        size: 1900,
        lines: 60,
        imports: ['uuid', 'datetime', 'typing'],
        functions: [
          { name: 'record_ledger_entry', kind: 'function', lineStart: 12, lineEnd: 42, parameters: ['account_id', 'amount', 'entry_type'] },
          { name: 'get_account_balance', kind: 'function', lineStart: 44, lineEnd: 59, parameters: ['account_id'] }
        ],
        content: `import uuid
import datetime
from typing import Dict, Any, List

_ledger_entries: List[Dict[str, Any]] = []

def record_ledger_entry(account_id: str, amount: float, entry_type: str) -> Dict[str, Any]:
    if amount <= 0:
        raise ValueError("Ledger entry amount must be positive")
    
    entry = {
        "id": f"led_{uuid.uuid4().hex[:12]}",
        "account_id": account_id,
        "amount": amount,
        "type": entry_type,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    _ledger_entries.append(entry)
    return entry

def get_account_balance(account_id: str) -> float:
    balance = 0.0
    for e in _ledger_entries:
        if e["account_id"] == account_id:
            if e["type"] == "credit":
                balance += e["amount"]
            else:
                balance -= e["amount"]
    return balance
`
      },
      {
        name: 'security.py',
        path: 'app/core/security.py',
        language: 'python',
        size: 1200,
        lines: 38,
        imports: ['hashlib'],
        content: `import hashlib

def hash_api_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()
`
      },
      {
        name: 'test_webhooks.py',
        path: 'tests/test_webhooks.py',
        language: 'python',
        size: 1400,
        lines: 45,
        imports: ['pytest', 'app.api.webhooks'],
        functions: [
          { name: 'test_valid_signature_verification', kind: 'function', lineStart: 10, lineEnd: 22, parameters: [] },
          { name: 'test_reject_tampered_payload', kind: 'function', lineStart: 24, lineEnd: 44, parameters: [] }
        ],
        content: `import pytest
import hmac
import hashlib
from app.api.webhooks import verify_signature, WEBHOOK_SECRET

def test_valid_signature_verification():
    payload = b'{"event": "payment_succeeded", "amount": 5000}'
    sig = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    assert verify_signature(payload, sig) is True

def test_reject_tampered_payload():
    payload = b'{"event": "payment_succeeded", "amount": 5000}'
    tampered = b'{"event": "payment_succeeded", "amount": 9999}'
    sig = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    assert verify_signature(tampered, sig) is False
`
      },
      {
        name: 'requirements.txt',
        path: 'requirements.txt',
        language: 'plaintext',
        size: 120,
        lines: 5,
        content: `fastapi==0.109.0
uvicorn==0.27.0
pytest==8.0.0
cryptography==41.0.7
`
      },
      {
        name: 'README.md',
        path: 'README.md',
        language: 'markdown',
        size: 450,
        lines: 16,
        content: `# FinPay Settlement Gateway

FastAPI service for webhook ingestion and automated balance reconciliation.
`
      }
    ]
  }
];
