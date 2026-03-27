"""add scenario_title and current_stage to sessions

Revision ID: d81be0ebe5fc
Revises: 4c5152e5b729
Create Date: 2026-03-21 00:36:51.665809

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd81be0ebe5fc'
down_revision: Union[str, Sequence[str], None] = '4c5152e5b729'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('sessions', sa.Column('scenario_title', sa.String(), nullable=True))
    op.add_column('sessions', sa.Column('current_stage', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('sessions', 'current_stage')
    op.drop_column('sessions', 'scenario_title')