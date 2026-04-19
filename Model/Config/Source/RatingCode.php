<?php

declare(strict_types=1);

namespace Hmh\ReviewChart\Model\Config\Source;

use Magento\Framework\Data\OptionSourceInterface;
use Magento\Review\Model\ResourceModel\Rating\CollectionFactory;

class RatingCode implements OptionSourceInterface
{
    public function __construct(
        private readonly CollectionFactory $collectionFactory
    ) {
    }

    public function toOptionArray(): array
    {
        $options = [];
        $collection = $this->collectionFactory->create();
        $collection->addFieldToSelect('rating_code');
        $collection->setOrder('rating_code', 'ASC');

        foreach ($collection as $rating) {
            $ratingCode = (string) $rating->getRatingCode();
            if (!$ratingCode) {
                continue;
            }

            $options[] = [
                'value' => $ratingCode,
                'label' => $ratingCode,
            ];
        }

        return $options;
    }
}
