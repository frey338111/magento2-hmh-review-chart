<?php
declare(strict_types=1);

namespace Hmh\ReviewChart\Model;

use Magento\Review\Model\ResourceModel\Rating\CollectionFactory as RatingCollectionFactory;
use Magento\Store\Model\StoreManagerInterface;

class AverageRatingCalculator
{
    private const MAX_RATING_SCORE = 5.0;
    private const PERCENT_SCALE = 100.0;
    private const MINIMUM_RATING_CODES = 3;

    public function __construct(
        private readonly ConfigProvider $configProvider,
        private readonly StoreManagerInterface $storeManager,
        private readonly RatingCollectionFactory $ratingCollectionFactory
    ) {
    }

    /**
     * Return average score per configured rating code as whole numbers on a 1-5 scale.
     *
     * @return array<string, int>
     */
    public function calculateForProductId(int $productId): array
    {
        if (!$this->configProvider->isEnabled() || $productId <= 0) {
            return [];
        }

        $ratingCodes = $this->configProvider->getRatingCodes();
        if (count($ratingCodes) < self::MINIMUM_RATING_CODES) {
            return [];
        }

        $storeId = (int) $this->storeManager->getStore()->getId();
        $collection = $this->ratingCollectionFactory->create();
        $collection->addFieldToFilter('main_table.rating_code', ['in' => $ratingCodes]);
        $collection->addRatingPerStoreName($storeId);
        $collection->load();
        $collection->addEntitySummaryToItem($productId, $storeId);

        $averages = [];

        foreach ($collection as $rating) {
            $summary = $rating->getSummary();
            if ($summary === null) {
                continue;
            }

            $ratingCode = trim((string) $rating->getRatingCode());
            if ($ratingCode === '') {
                continue;
            }

            $averages[$ratingCode] = (int) round(
                ((float) $summary / self::PERCENT_SCALE) * self::MAX_RATING_SCORE
            );
        }

        if (count($averages) < self::MINIMUM_RATING_CODES) {
            return [];
        }

        return $averages;
    }
}
