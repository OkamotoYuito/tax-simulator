"use client";

const explanations = [
  {
    title: "所得税",
    icon: "📊",
    color: "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30",
    headerColor: "text-rose-700 dark:text-rose-400",
    content: (
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>累進課税</strong>という仕組みで、所得が高くなるほど税率が上がります。ただし、すべての所得に高い税率がかかるわけではなく、<strong>超過分だけ</strong>に高い税率が適用されます。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-gray-200 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">課税所得</th>
                <th className="px-2 py-1 text-right">税率</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["195万円以下", "5%"],
                ["195万〜330万円", "10%"],
                ["330万〜695万円", "20%"],
                ["695万〜900万円", "23%"],
                ["900万〜1,800万円", "33%"],
                ["1,800万〜4,000万円", "40%"],
                ["4,000万円超", "45%"],
              ].map(([range, rate]) => (
                <tr key={range} className="border-t border-gray-100">
                  <td className="px-2 py-1">{range}</td>
                  <td className="px-2 py-1 text-right font-medium text-rose-600">{rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500">
          ※ 2037年まで復興特別所得税（基準税額の2.1%）が上乗せされます。
        </p>
      </div>
    ),
  },
  {
    title: "住民税",
    icon: "🏘️",
    color: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30",
    headerColor: "text-orange-700 dark:text-orange-400",
    content: (
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          道府県民税（4%）と市区町村民税（6%）の合計<strong>10%</strong>の<strong>所得割</strong>と、
          所得に関係なく定額の<strong>均等割（約5,000円）</strong>から構成されます。
        </p>
        <p>
          <strong>前年の所得</strong>に基づいて計算され、翌年6月から課税されます。新卒1年目は住民税がかからないのはこのためです。
        </p>
        <p>
          使途は道路・公園・学校など地元の行政サービスに使われます。
        </p>
      </div>
    ),
  },
  {
    title: "厚生年金保険料",
    icon: "🏦",
    color: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
    headerColor: "text-amber-700 dark:text-amber-400",
    content: (
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          保険料率は<strong>18.3%</strong>で、労使折半のため本人負担は<strong>9.15%</strong>です。
          計算には実際の給与ではなく<strong>標準報酬月額（SMR）</strong>という等級制の金額が使われます。
        </p>
        <p>
          納めた保険料は将来の老齢厚生年金として受け取れます。払った額が多いほど将来の受給額も増えます。
        </p>
        <p className="text-xs text-gray-500">
          ※ SMRの上限は月65万円。高収入でも保険料はこの額が上限です。
        </p>
      </div>
    ),
  },
  {
    title: "健康保険料",
    icon: "🏥",
    color: "border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/30",
    headerColor: "text-teal-700 dark:text-teal-400",
    content: (
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          病院にかかったときの医療費の<strong>7割を国が負担</strong>してくれる財源です。
          料率は都道府県や加入している健康保険組合によって異なります（協会けんぽの場合）。
        </p>
        <p>
          労使折半のため、会社も同額を負担しています。実際にかかっている保険料は表示額の2倍です。
        </p>
      </div>
    ),
  },
  {
    title: "雇用保険料",
    icon: "💼",
    color: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30",
    headerColor: "text-green-700 dark:text-green-400",
    content: (
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          失業した際の<strong>失業給付（失業手当）</strong>や、
          育児休業中の<strong>育児休業給付金</strong>などの財源です。
        </p>
        <p>
          2024年度の一般労働者の保険料率は<strong>1.55%</strong>（うち労働者負担0.6%、事業主負担0.95%）。
          給与総額に対して計算されます。
        </p>
      </div>
    ),
  },
  {
    title: "介護保険料",
    icon: "🤝",
    color: "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30",
    headerColor: "text-purple-700 dark:text-purple-400",
    content: (
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>40歳以上64歳</strong>の方が健康保険料と合わせて納める保険料です。
          高齢化社会に備えた介護サービス（訪問介護・特別養護老人ホームなど）の財源です。
        </p>
        <p>
          料率は<strong>1.6%</strong>（労使折半、本人負担0.8%）。健康保険料の計算式と同じSMRを使用します。
        </p>
      </div>
    ),
  },
  {
    title: "給与所得控除",
    icon: "📝",
    color: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30",
    headerColor: "text-blue-700 dark:text-blue-400",
    content: (
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          会社員の場合、スーツや資格取得費など<strong>仕事に必要な経費</strong>を実費で申告するのが難しいため、
          給与収入に応じて一定額を<strong>概算で控除</strong>できる制度です。
        </p>
        <p>
          自営業者が実費の経費を計上できるのと同様の考え方で、税負担を公平にするための仕組みです。
          控除額が大きいほど課税所得が減り、税金が安くなります。
        </p>
      </div>
    ),
  },
  {
    title: "奨学金返済について",
    icon: "🎓",
    color: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30",
    headerColor: "text-yellow-700 dark:text-yellow-400",
    content: (
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          奨学金の返済は<strong>税制上の所得控除にはなりません</strong>（一部の寄付型奨学金を除く）。
          そのため所得税や住民税の計算には影響しません。
        </p>
        <p>
          このシミュレーターでは、手取り額から奨学金返済額を差し引いた
          <strong>「可処分所得」</strong>として実態に近い生活費を把握できるようにしています。
        </p>
      </div>
    ),
  },
];

function ExplanationCard({
  title,
  icon,
  color,
  headerColor,
  content,
}: (typeof explanations)[number]) {
  return (
    <details className={`group rounded-lg border ${color}`}>
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 hover:opacity-90 rounded-lg">
        <span className="text-lg">{icon}</span>
        <span className={`flex-1 text-sm font-semibold ${headerColor}`}>{title}</span>
        <svg
          className={`h-4 w-4 transition-transform group-open:rotate-180 ${headerColor}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 pt-1">{content}</div>
    </details>
  );
}

export default function TaxExplanation() {
  return (
    <div className="space-y-2">
      {explanations.map((exp) => (
        <ExplanationCard key={exp.title} {...exp} />
      ))}
    </div>
  );
}
