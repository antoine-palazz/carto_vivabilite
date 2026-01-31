"""
Scoring service - calculates weighted scores for communes.

Uses DataRegistry to get default weights from manifest.
"""

from app.services.data_registry import get_data_registry


class ScoringService:
    """Service for score calculation logic."""

    def __init__(self) -> None:
        """Initialize with data registry."""
        self.registry = get_data_registry()

    def calculate_global_score(
        self,
        scores: dict[str, float],
        weights: dict[str, float],
    ) -> float:
        """
        Calculate weighted global score.

        Args:
            scores: Individual category scores for a commune (filter_id -> score)
            weights: Weight for each category (filter_id -> weight 0-100)

        Returns:
            Weighted average score (0-100)
        """
        total_weight = 0.0
        weighted_sum = 0.0

        for filter_id, weight in weights.items():
            if weight > 0 and filter_id in scores:
                score_value = scores[filter_id]
                weighted_sum += score_value * weight
                total_weight += weight

        if total_weight == 0:
            return 50.0  # Return neutral score if no weights

        return round(weighted_sum / total_weight, 1)

    def get_default_weights(self) -> dict[str, float]:
        """
        Get default weights for all available filters.

        Returns weights from manifest configuration.
        """
        filters = self.registry.get_available_filters()
        return {f.id: float(f.weight_default) for f in filters}
