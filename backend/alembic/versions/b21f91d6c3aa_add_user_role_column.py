"""add user role column

Revision ID: b21f91d6c3aa
Revises: 6941c94ae06b
Create Date: 2026-04-12 10:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b21f91d6c3aa'
down_revision: Union[str, None] = '6941c94ae06b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("users")}

    if "role" not in columns:
        user_role_enum = sa.Enum("USER", "ADMIN", name="userrole")
        user_role_enum.create(bind, checkfirst=True)

        op.add_column(
            "users",
            sa.Column("role", user_role_enum, nullable=False, server_default="USER"),
        )

        op.execute("UPDATE users SET role = 'USER' WHERE role IS NULL")
        op.alter_column("users", "role", server_default=None)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("users")}

    if "role" in columns:
        op.drop_column("users", "role")

    user_role_enum = sa.Enum("USER", "ADMIN", name="userrole")
    user_role_enum.drop(bind, checkfirst=True)
