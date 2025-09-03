"use client"

import { useState, forwardRef, useImperativeHandle, lazy, Suspense } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Minus, Trash2, ShoppingCart, X, Save } from "lucide-react"
import type { CartItem, SaleType, Transaction, Product } from "@/lib/types"
import axios from "axios"
import { toast } from "react-toastify"

// Dynamically import ReceiptDialog to reduce initial load time
const ReceiptDialog = lazy(() => import("@/components/sales/receipt-dialog").then(mod => ({ default: mod.ReceiptDialog })));

interface TransactionTab {
  id: string
  name: string
  cart: CartItem[]
  saleType: SaleType
}

interface TransactionTabsProps {
  products: Product[]
  onUpdateQuantity: (productId: string, priceType: "retail" | "wholesale", quantity: number) => void
  onRemoveItem: (productId: string, priceType: "retail" | "wholesale") => void
  onAddToCart: (productId: string, quantity: number, priceType: "retail" | "wholesale") => void
}

interface TransactionTabsRef {
  addToCurrentTab: (productId: string, quantity: number, priceType: "retail" | "wholesale") => void
}

export const TransactionTabs = forwardRef<TransactionTabsRef, TransactionTabsProps>(
  ({ products, onUpdateQuantity, onRemoveItem, onAddToCart }, ref) => {
    const [tabs, setTabs] = useState<TransactionTab[]>([
      { id: "1", name: "Transaction 1", cart: [], saleType: "retail" },
    ])
    const [activeTab, setActiveTab] = useState("1")
    const [nextTabId, setNextTabId] = useState(2)
    const [showReceipt, setShowReceipt] = useState(false)
    const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)

    const API = process.env.NEXT_PUBLIC_API_URL
    const currentTabData = tabs.find((tab) => tab.id === activeTab)

    useImperativeHandle(ref, () => ({
      addToCurrentTab: handleAddToCurrentTab,
    }))

    const addNewTab = () => {
      const newTab: TransactionTab = {
        id: nextTabId.toString(),
        name: `Transaction ${nextTabId}`,
        cart: [],
        saleType: "retail",
      }
      setTabs([...tabs, newTab])
      setActiveTab(newTab.id)
      setNextTabId(nextTabId + 1)
    }

    const closeTab = (tabId: string) => {
      if (tabs.length === 1) return // Don't close the last tab

      const newTabs = tabs.filter((tab) => tab.id !== tabId)
      setTabs(newTabs)

      if (activeTab === tabId) {
        setActiveTab(newTabs[0].id)
      }
    }

    const updateTabCart = (tabId: string, newCart: CartItem[]) => {
      setTabs(tabs.map((tab) => (tab.id === tabId ? { ...tab, cart: newCart } : tab)))
    }

    const updateTabSaleType = (tabId: string, saleType: SaleType) => {
      setTabs(tabs.map((tab) => (tab.id === tabId ? { ...tab, saleType } : tab)))
    }

    const handleUpdateQuantity = (productId: string, priceType: "retail" | "wholesale", quantity: number) => {
      if (!currentTabData) return

      const updatedCart = currentTabData.cart.map((item) =>
        (item.product._id === productId || item.product.id === productId) && item.price_type === priceType
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      )
      updateTabCart(activeTab, updatedCart)
    }

    const handleRemoveItem = (productId: string, priceType: "retail" | "wholesale") => {
      if (!currentTabData) return

      const updatedCart = currentTabData.cart.filter(
        (item) => !((item.product._id === productId || item.product.id === productId) && item.price_type === priceType),
      )
      updateTabCart(activeTab, updatedCart)
    }

    const handleUpdatePrice = (productId: string, priceType: "retail" | "wholesale", newPrice: number) => {
      if (!currentTabData || isNaN(newPrice) || newPrice < 0) return

      const updatedCart = currentTabData.cart.map((item) => {
        if ((item.product._id === productId || item.product.id === productId) && item.price_type === priceType) {
          // Create a copy of the product with the updated price
          const updatedProduct = { ...item.product };
          if (priceType === "retail") {
            updatedProduct.retail_price = newPrice;
          } else {
            updatedProduct.wholesale_price = newPrice;
          }
          return { ...item, product: updatedProduct };
        }
        return item;
      });
      
      updateTabCart(activeTab, updatedCart);
      console.log(`[v0] Updated ${priceType} price for product ${productId} to $${newPrice.toFixed(2)}`);
    }

    const handleClearCart = () => {
      updateTabCart(activeTab, [])
    }

    const handleSaveSale = async () => {
      if (!currentTabData || currentTabData.cart.length === 0) return

      const subtotal = currentTabData.cart.reduce((sum, item) => {
        const price = item.price_type === "retail" ? item.product.retail_price || 0 : item.product.wholesale_price || 0
        return sum + price * item.quantity
      }, 0)

      const total = subtotal

      // Create transaction for receipt display (optional)
      const transaction: any = {
        id: Date.now(),
        items: currentTabData.cart,
        subtotal,
        total,
        sale_type: currentTabData.saleType,
        status: "completed",
        created_at: new Date().toISOString(),
      }

      // Format cart items for API
      const formattedItems = currentTabData.cart.map(item => {
        const retailPrice = item.product.retailPrice || item.product.retail_price || 0;
        const wholesalePrice = item.product.wholeSalePrice || item.product.wholesale_price || 0;
        const price = item.price_type === "retail" ? retailPrice : wholesalePrice;
        
        // Make sure we're passing a valid product ID
        const productId = item.product._id || item.product.id;
        
        console.log("Product being sent to API:", {
          productId,
          name: item.product.name,
          fullProduct: item.product
        });
        
        return {
          productId: productId, // Match the exact field name from backend code
          name: item.product.name,
          quantity: item.quantity,
          price: price,
          totalPrice: price * item.quantity,
          customerType: currentTabData.saleType // Add customer type to each item
        };
      });

      // The backend expects an array of items directly
      const saleData = formattedItems;

      try {
        // Log the complete data being sent
        console.log("Sending sale data to API:", JSON.stringify(saleData, null, 2));
        
        // Send data to API as an array
        const response = await axios.post(`${API}/api/V1/sales/add`, saleData);

        if (response.status === 200 || response.status === 201) {
          toast.success("Sale successfully recorded!");
          
          // Optional: Show receipt
          setCurrentTransaction(transaction);
          setShowReceipt(true);
          
          // Clear the cart after successful save
          updateTabCart(activeTab, []);
        } else {
          toast.error("Failed to record sale. Please try again.");
        }
      } catch (error) {
        console.error("Error saving sale:", error);
        toast.error("Error saving sale. Please try again.");
        
        // Still show receipt for offline functionality
        setCurrentTransaction(transaction);
        setShowReceipt(true);
      }
    }

    const handleAddToCurrentTab = (productId: string, quantity: number, priceType: "retail" | "wholesale") => {
      if (!currentTabData) return

      // Find the product in the products array passed as prop
      let product = products.find((p) => p._id === productId || p.id === productId)

      if (!product) {
        console.error("[v0] Product not found:", productId)
        return
      }

      // Ensure product has either _id or id
      if (!product._id && !product.id) {
        // Generate a temporary ID if neither _id nor id exists
        product = {
          ...product,
          _id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        };
        console.log("[v0] Generated temporary ID for product:", product);
      }

      // Standardize product fields for consistent access
      if (!product.retail_price && product.retailPrice) {
        product.retail_price = product.retailPrice;
      }
      if (!product.wholesale_price && product.wholeSalePrice) {
        product.wholesale_price = product.wholeSalePrice;
      }

      const actualPriceType = currentTabData.saleType === "retail" ? "retail" : "wholesale"

      const existingItemIndex = currentTabData.cart.findIndex(
        (item) => (item.product._id === productId || item.product.id === productId) && item.price_type === actualPriceType,
      )

      let updatedCart: CartItem[]
      if (existingItemIndex >= 0) {
        updatedCart = currentTabData.cart.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        const newItem: CartItem = {
          product,
          quantity,
          price_type: actualPriceType,
        }
        updatedCart = [...currentTabData.cart, newItem]
      }

      updateTabCart(activeTab, updatedCart)
      console.log("Added to cart:", { 
        product: product.name, 
        productId: product._id || product.id, 
        quantity, 
        priceType: actualPriceType 
      })
    }

    if (!currentTabData) return null

    const subtotal = currentTabData.cart.reduce((sum, item) => {
      const price = item.price_type === "retail" ? item.product.retail_price || 0 : item.product.wholesale_price || 0
      return sum + price * item.quantity
    }, 0)

    const total = subtotal

    return (
      <>
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Transactions
              </h3>
              <Button onClick={addNewTab} size="sm" className="gap-1 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">New Transaction</span>
                <span className="xs:hidden">New</span>
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center gap-2 mb-4">
                <ScrollArea className="w-full max-w-full">
                  <div className="flex overflow-x-auto py-1">
                    <TabsList className="flex grid-cols-none justify-start w-max">
                      {tabs.map((tab) => (
                        <div key={tab.id} className="flex items-center">
                          <TabsTrigger value={tab.id} className="relative pr-8 whitespace-nowrap">
                            {tab.name}
                            {tab.cart.length > 0 && (
                              <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                                {tab.cart.length}
                              </Badge>
                            )}
                          </TabsTrigger>
                          {tabs.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 -ml-6 z-10"
                              onClick={() => closeTab(tab.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </TabsList>
                  </div>
                </ScrollArea>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sale Type:</span>
                <div className="flex gap-1">
                  <Button
                    variant={currentTabData.saleType === "retail" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateTabSaleType(activeTab, "retail")}
                    className="text-xs h-8"
                  >
                    Retail
                  </Button>
                  <Button
                    variant={currentTabData.saleType === "wholesale" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateTabSaleType(activeTab, "wholesale")}
                    className="text-xs h-8"
                  >
                    Wholesale
                  </Button>
                </div>
              </div>
            </Tabs>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col min-h-0">
            {currentTabData.cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center py-8 text-muted-foreground">
                <div className="max-w-sm">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">Your cart is empty</p>
                  <p className="text-sm">
                    Add products from the catalog to get started with your sale.
                  </p>
                  <div className="mt-6 text-xs">
                    <p className="opacity-70">
                      Quick Tips:
                    </p>
                    <ul className="mt-2 space-y-1 list-disc list-inside text-left">
                      <li>Click on product cards to add items</li>
                      <li>Use the + and - buttons to adjust quantity</li>
                      <li>Hover over prices to modify them</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto mb-4 px-1 py-1">
                  <div className="text-xs text-muted-foreground px-1 py-1">
                    <span className="inline-block mr-1">💡</span>
                    <span>Tip: Hover over prices to edit. Click on quantity to modify.</span>
                  </div>
                  {currentTabData.cart.map((item, index) => {
                    const price =
                      item.price_type === "retail" ? item.product.retailPrice : item.product.wholeSalePrice
                    return (
                      <div
                        key={`cart-item-${index}-${item.product._id || item.product.id || `noId-${index}`}-${item.price_type}`}
                        className="flex flex-wrap md:flex-nowrap items-center gap-3 p-3 border rounded-lg hover:bg-muted/20 transition-colors"
                      >
                        <img
                          src={item.product.image || "/placeholder.svg?height=50&width=50"}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=50&width=50";
                          }}
                        />

                        <div className="flex-1 min-w-0 mb-2 md:mb-0">
                          <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="relative group">
                              <span className="text-sm font-semibold text-primary cursor-pointer group-hover:opacity-0">
                                ${(price || 0).toFixed(2)}
                              </span>
                              <Input
                                type="number"
                                defaultValue={(price || 0).toFixed(2)}
                                step="0.01"
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 focus:opacity-100 h-6 py-0 px-1 text-sm font-semibold"
                                onFocus={(e) => e.target.select()}
                                onBlur={(e) => {
                                  const newPrice = parseFloat(e.target.value);
                                  if (!isNaN(newPrice) && newPrice >= 0) {
                                    handleUpdatePrice(
                                      item.product._id || item.product.id || "",
                                      item.price_type,
                                      newPrice
                                    );
                                  } else {
                                    // Reset to original value if invalid input
                                    e.target.value = (price || 0).toFixed(2);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                  }
                                }}
                              />
                            </div>
                            <Badge variant={item.price_type === "retail" ? "default" : "secondary"} className="text-xs">
                              {item.price_type}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <div className="flex items-center border rounded shadow-sm flex-1 md:flex-initial">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 md:h-9 md:w-9"
                              onClick={() => handleUpdateQuantity(item.product._id || item.product.id || "", item.price_type, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  item.product._id || item.product.id || "",
                                  item.price_type,
                                  Number.parseInt(e.target.value) || 1,
                                )
                              }
                              onFocus={(e) => e.target.select()}
                              className="h-8 w-12 md:h-9 md:w-16 text-center text-sm border-0 focus-visible:ring-1 focus-visible:ring-primary"
                              min="1"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 md:h-9 md:w-9"
                              onClick={() => handleUpdateQuantity(item.product._id || item.product.id || "", item.price_type, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 md:h-9 md:w-9 text-destructive hover:text-destructive hover:bg-red-50"
                            onClick={() => handleRemoveItem(item.product._id || item.product.id || "", item.price_type)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                          <div className="font-semibold text-base">${((price || 0) * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex-shrink-0">
                  <Separator className="mb-4" />

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                 
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-2">
                    <Button
                      onClick={handleSaveSale}
                      className="flex-1 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground h-10 py-2"
                      disabled={currentTabData.cart.length === 0}
                    >
                      <Save className="h-4 w-4" />
                      <span className="font-medium">Save Sale</span>
                    </Button>
                  </div>

                  <Button
                    onClick={handleClearCart}
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive hover:bg-red-50 h-9"
                    disabled={currentTabData.cart.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {showReceipt && currentTransaction && (
          <Suspense fallback={<div>Loading receipt...</div>}>
            <ReceiptDialog transaction={currentTransaction} isOpen={showReceipt} onClose={() => setShowReceipt(false)} />
          </Suspense>
        )}
      </>
    )
  },
)

TransactionTabs.displayName = "TransactionTabs"
