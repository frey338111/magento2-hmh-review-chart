<?php
declare(strict_types=1);

namespace Hmh\ReviewChart\Block;

use Hmh\ReviewChart\Model\AverageRatingCalculator;
use Hmh\ReviewChart\Model\ConfigProvider;
use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Catalog\Block\Product\Context;
use Magento\Catalog\Helper\Product;
use Magento\Catalog\Model\ProductTypes\ConfigInterface;
use Magento\Customer\Model\Session;
use Magento\Framework\Json\EncoderInterface as JsonEncoderInterface;
use Magento\Framework\Locale\FormatInterface;
use Magento\Framework\Pricing\PriceCurrencyInterface;
use Magento\Framework\Stdlib\StringUtils;
use Magento\Framework\Url\EncoderInterface;
use Magento\Review\Model\ResourceModel\Review\CollectionFactory;
use Magento\Review\Block\Product\View as ProductView;

class RatingChart extends ProductView
{
    private ?array $aggregatedRatings = null;

    public function __construct(
        Context $context,
        EncoderInterface $urlEncoder,
        JsonEncoderInterface $jsonEncoder,
        StringUtils $string,
        Product $productHelper,
        ConfigInterface $productTypeConfig,
        FormatInterface $localeFormat,
        Session $customerSession,
        ProductRepositoryInterface $productRepository,
        PriceCurrencyInterface $priceCurrency,
        CollectionFactory $collectionFactory,
        private readonly ConfigProvider $configProvider,
        private readonly AverageRatingCalculator $averageRatingCalculator,
        array $data = []
    ) {
        parent::__construct(
            $context,
            $urlEncoder,
            $jsonEncoder,
            $string,
            $productHelper,
            $productTypeConfig,
            $localeFormat,
            $customerSession,
            $productRepository,
            $priceCurrency,
            $collectionFactory,
            $data
        );
    }

    /**
     * Return average score per configured rating code as whole numbers on a 1-5 scale.
     *
     * @return array<string, int>
     */
    public function getAggregatedRating(): array
    {
        if (!$this->configProvider->isEnabled()) {
            return [];
        }

        if ($this->aggregatedRatings !== null) {
            return $this->aggregatedRatings;
        }

        $product = $this->getProduct();
        if ($product === null) {
            return [];
        }

        $this->aggregatedRatings = $this->averageRatingCalculator->calculateForProductId(
            (int) $product->getId()
        );

        return $this->aggregatedRatings;
    }
}
